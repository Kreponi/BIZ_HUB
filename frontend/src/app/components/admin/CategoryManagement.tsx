import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
  FolderTree,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";
import { apiRequest, invalidateApiCache, isAbortError } from "@/lib/api";
import { useDebouncedValue } from "@/app/components/ui/use-debounced-value";

type Category = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  product_count: number;
  created_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const PAGE_SIZE = 20;

export const CategoryManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const isInitialLoading = isLoading && categories.length === 0;

  const fetchTotalCategories = async () => {
    const data = await apiRequest<PaginatedResponse<Category>>("/categories/?page=1");
    setTotalCategories(data.count);
  };

  const fetchCategoriesPage = async (page: number, query: string, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (query.trim()) {
      params.set("q", query.trim());
    }
    const data = await apiRequest<PaginatedResponse<Category>>(
      `/categories/?${params.toString()}`,
      { signal },
    );
    setCategories(data.results);
    setFilteredCount(data.count);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchTotalCategories(), fetchCategoriesPage(1, "")]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load categories",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      const isFirstLoad = categories.length === 0;
      try {
        if (isFirstLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        await fetchCategoriesPage(currentPage, debouncedSearchTerm, controller.signal);
      } catch (error) {
        if (!isAbortError(error)) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load categories",
          );
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nextImage = reader.result as string;
        setImagePreview(nextImage);
        setFormData((prev) => ({ ...prev, image_url: nextImage }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        image_url: category.image || "",
      });
      setImagePreview(category.image || "");
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image_url: "",
      });
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const refreshAfterMutation = async () => {
    await Promise.all([
      fetchCategoriesPage(currentPage, debouncedSearchTerm),
      fetchTotalCategories(),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await apiRequest<Category>(`/categories/${editingCategory.id}/`, {
          method: "PATCH",
          body: {
            name: formData.name,
            description: formData.description,
            image: formData.image_url || null,
          },
        });
        toast.success("Category updated successfully!");
      } else {
        await apiRequest<Category>("/categories/", {
          method: "POST",
          body: {
            name: formData.name,
            description: formData.description,
            image: formData.image_url || null,
          },
        });
        toast.success("Category created successfully!");
      }
      invalidateApiCache("/categories/");
      invalidateApiCache("/products/");
      invalidateApiCache("/analytics/summary/");

      setIsDialogOpen(false);
      setEditingCategory(null);
      await refreshAfterMutation();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
    }
  };

  const handleDelete = async (category: Category) => {
    if ((category.product_count || 0) > 0) {
      toast.error(
        `Cannot delete category with ${category.product_count} products. Remove products first.`,
      );
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await apiRequest<void>(`/categories/${category.id}/`, { method: "DELETE" });
        toast.success("Category deleted successfully!");
        invalidateApiCache("/categories/");
        invalidateApiCache("/products/");
        invalidateApiCache("/analytics/summary/");
        await refreshAfterMutation();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete category",
        );
      }
    }
  };

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
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search categories..."
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
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Running Shoes"
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
                  placeholder="High-performance running shoes for all terrains"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image">Category Image</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image_url: "" }));
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image for this category (optional).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <FolderTree className="h-12 w-12 text-blue-600" />
          <div>
            {isInitialLoading ? (
              <>
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">{totalCategories}</p>
                <p className="text-gray-600">Total Categories</p>
              </>
            )}
          </div>
        </div>
      </Card>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={`category-card-skeleton-${idx}`} className="p-6">
              <Skeleton className="mb-4 h-40 w-full rounded-lg" />
              <Skeleton className="h-6 w-40 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-7 w-24 rounded-full mb-4" />
              <div className="flex gap-2 pt-4 border-t">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : isLoading ? (
        <Card className="p-6 text-sm text-gray-600">Loading categories...</Card>
      ) : categories.length === 0 ? (
        <Card className="p-6 text-sm text-gray-600">No categories found.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const productCount = category.product_count || 0;
            return (
              <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 h-40 rounded-lg overflow-hidden bg-gray-100 border">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderTree className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                      {productCount} {productCount === 1 ? "product" : "products"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(category)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleDelete(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={productCount > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">All Categories</h3>
          {isRefreshing && (
            <p className="text-xs text-blue-600 mt-1 animate-pulse">Updating categories...</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={`category-row-skeleton-${idx}`}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-72" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : categories.map((category) => {
                const productCount = category.product_count || 0;
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-gray-600">{category.description}</p>
                    </TableCell>
                    <TableCell>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                        {productCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(category)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={productCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          <strong>Note:</strong> Categories with products cannot be deleted. You must first remove
          or reassign all products in a category before deleting it.
        </p>
      </div>
    </div>
  );
};
