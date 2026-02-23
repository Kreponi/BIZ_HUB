import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";
import { apiRequest, invalidateApiCache, isAbortError } from "@/lib/api";
import { useDebouncedValue } from "@/app/components/ui/use-debounced-value";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  images: string[];
  seller_phone: string;
  seller_name: string;
  created_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const PAGE_SIZE = 20;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

export const ProductManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_urls: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const cediFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }),
    [],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const isInitialLoading = isLoading && products.length === 0;

  const fetchCategories = async (): Promise<Category[]> => {
    const categoriesData = await apiRequest<Category[]>("/categories/");
    setCategories(categoriesData);
    return categoriesData;
  };

  const fetchTotalProducts = async () => {
    const data = await apiRequest<PaginatedResponse<Product>>("/products/?page=1");
    setTotalProducts(data.count);
  };

  const fetchTopCategoryCounts = async (sourceCategories: Category[]) => {
    const top = sourceCategories.slice(0, 3);
    const responses = await Promise.all(
      top.map((category) =>
        apiRequest<PaginatedResponse<Product>>(
          `/products/?page=1&category_id=${category.id}`,
        ),
      ),
    );
    const nextCounts: Record<number, number> = {};
    top.forEach((category, index) => {
      nextCounts[category.id] = responses[index].count;
    });
    setCategoryCounts(nextCounts);
  };

  const fetchProductsPage = async (page: number, query: string, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (query.trim()) {
      params.set("q", query.trim());
    }
    const data = await apiRequest<PaginatedResponse<Product>>(`/products/?${params.toString()}`, {
      signal,
    });
    setProducts(data.results);
    setFilteredCount(data.count);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const categoriesData = await fetchCategories();
        await Promise.all([
          fetchTotalProducts(),
          fetchTopCategoryCounts(categoriesData),
          fetchProductsPage(1, ""),
        ]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      const isFirstLoad = products.length === 0;
      try {
        if (isFirstLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        await fetchProductsPage(currentPage, debouncedSearchTerm, controller.signal);
      } catch (error) {
        if (!isAbortError(error)) {
          toast.error(error instanceof Error ? error.message : "Failed to load products");
        }
      } finally {
        if (!controller.signal.aborted) {
          if (isFirstLoad) {
            setIsLoading(false);
          } else {
            setIsRefreshing(false);
          }
        }
      }
    };
    void run();

    return () => {
      controller.abort();
    };
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    try {
      const nextImages = await Promise.all(files.map(readFileAsDataUrl));
      setImagePreviews(nextImages);
      setFormData((prev) => ({ ...prev, image_urls: nextImages }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to read selected images");
    } finally {
      e.target.value = "";
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: String(product.category_id),
        image_urls: product.images || [],
      });
      setImagePreviews(product.images || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_urls: [],
      });
      setImagePreviews([]);
    }
    setIsDialogOpen(true);
  };

  const refreshAfterMutation = async () => {
    await Promise.all([
      fetchProductsPage(currentPage, debouncedSearchTerm),
      fetchTotalProducts(),
      fetchTopCategoryCounts(categories),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: Number(formData.category_id),
        images: formData.image_urls,
        seller_name: editingProduct?.seller_name || "Seller",
        seller_phone: editingProduct?.seller_phone || "+233000000000",
      };

      if (editingProduct) {
        await apiRequest<Product>(`/products/${editingProduct.id}/`, {
          method: "PATCH",
          body: payload,
        });
        toast.success("Product updated successfully!");
      } else {
        await apiRequest<Product>("/products/", {
          method: "POST",
          body: payload,
        });
        toast.success("Product created successfully!");
      }
      invalidateApiCache("/products/");
      invalidateApiCache("/analytics/summary/");

      setIsDialogOpen(false);
      setEditingProduct(null);
      await refreshAfterMutation();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    }
  };

  const handleDelete = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiRequest<void>(`/products/${productId}/`, { method: "DELETE" });
        toast.success("Product deleted successfully!");
        invalidateApiCache("/products/");
        invalidateApiCache("/analytics/summary/");
        await refreshAfterMutation();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete product");
      }
    }
  };

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name || "Unknown";

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(
      (n) => n <= totalPages,
    );
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage all products in your store</p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Nike Air Zoom Pegasus 40"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                  placeholder="Detailed product description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (GHS) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    placeholder="129.99"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">
                  Product Images
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    {imagePreviews.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreviews([]);
                          setFormData((prev) => ({ ...prev, image_urls: [] }));
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${index}-${preview.slice(0, 32)}`}
                          className="relative w-full h-28 border rounded-lg overflow-hidden bg-gray-50"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload up to multiple files at once.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isInitialLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`stat-skeleton-${idx}`} className="p-4">
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-28" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
            </Card>
            {categories.slice(0, 3).map((category) => (
              <Card key={category.id} className="p-4">
                <div>
                  <p className="text-2xl font-bold">{categoryCounts[category.id] || 0}</p>
                  <p className="text-sm text-gray-600">{category.name}</p>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <Card>
        {isRefreshing && (
          <div className="px-4 pt-3 text-xs text-blue-600 animate-pulse">Updating products...</div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={`product-row-skeleton-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-52" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-600">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images[0] ||
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCategoryName(product.category_id)}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {cediFormatter.format(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Product CRUD now runs against your Django backend API.
        </p>
      </div>
    </div>
  );
};
