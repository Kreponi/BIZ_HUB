import React, { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { FilterSort, SortOption } from "./FilterSort";
import { Breadcrumbs } from "./Breadcrumbs";
import { apiRequest, isAbortError } from "@/lib/api";
import { Category, Product } from "@/types/catalog";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import { Skeleton } from "@/app/components/ui/skeleton";

interface CategoryPageProps {
  categoryId: string;
  onNavigateToProduct: (productId: string) => void;
  onBack: () => void;
  onPrefetchProduct?: () => void;
}

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const normalizePaginatedResponse = <T,>(
  payload: PaginatedResponse<T> | T[],
): PaginatedResponse<T> => {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }
  return payload;
};

const PAGE_SIZE = 20;

const sortToOrdering = (sortBy: SortOption): string => {
  switch (sortBy) {
    case "price-low":
      return "price";
    case "price-high":
      return "-price";
    case "name-asc":
      return "name";
    case "name-desc":
      return "-name";
    case "featured":
    default:
      return "-created_at";
  }
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  onNavigateToProduct,
  onBack,
  onPrefetchProduct,
}) => {
  const { trackEvent } = useAnalytics();
  const numericCategoryId = Number(categoryId);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [heroImageLoadFailed, setHeroImageLoadFailed] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    trackEvent("page_visit");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadCategory = async () => {
      try {
        const categoryData = await apiRequest<Category>(`/categories/${numericCategoryId}/`, {
          cacheTtlMs: 15000,
          signal: controller.signal,
        });
        setCategory(categoryData);
      } catch (error) {
        if (!isAbortError(error)) {
          setCategory(null);
        }
      }
    };
    void loadCategory();
    return () => {
      controller.abort();
    };
  }, [numericCategoryId]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      const isFirstLoad = products.length === 0;
      try {
        if (isFirstLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        const params = new URLSearchParams({
          page: String(currentPage),
          category_id: String(numericCategoryId),
          ordering: sortToOrdering(sortBy),
        });
        const data = await apiRequest<PaginatedResponse<Product> | Product[]>(
          `/products/?${params.toString()}`,
          {
          cacheTtlMs: 5000,
          signal: controller.signal,
          },
        );
        const normalized = normalizePaginatedResponse(data);
        setProducts(normalized.results);
        setTotalCount(normalized.count);
      } catch (error) {
        if (!isAbortError(error)) {
          setProducts([]);
          setTotalCount(0);
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
    void loadProducts();
    return () => {
      controller.abort();
    };
  }, [numericCategoryId, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [numericCategoryId, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setHeroImageLoadFailed(false);
  }, [category?.image]);

  const categoryHeroImageUrl = useMemo(() => {
    if (!category?.image) {
      return null;
    }
    if (
      category.image.startsWith("http://") ||
      category.image.startsWith("https://") ||
      category.image.startsWith("data:")
    ) {
      return category.image;
    }
    if (category.image.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
      const backendBase = apiBase.replace(/\/api\/?$/, "");
      return `${backendBase}${category.image}`;
    }
    return category.image;
  }, [category?.image]);

  const handleProductClick = (productId: number) => {
    trackEvent("product_click", { product_id: String(productId) });
    onNavigateToProduct(String(productId));
  };

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(
      (n) => n <= totalPages,
    );
  }, [currentPage, totalPages]);

  if (!isLoading && !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Category not found</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative text-white py-8 sm:py-12 overflow-hidden">
        {categoryHeroImageUrl && !heroImageLoadFailed ? (
          <>
            <img
              src={categoryHeroImageUrl}
              alt={category?.name || "Category"}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setHeroImageLoadFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/75 to-blue-700/75" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800" />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 sm:mb-6 text-white hover:text-white hover:bg-blue-700/70"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-72 bg-blue-400/40" />
                <Skeleton className="h-6 w-full max-w-[28rem] bg-blue-400/30" />
                <Skeleton className="h-4 w-52 bg-blue-400/30" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                  {category?.name}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-2">
                  {category?.description}
                </p>
                <p className="text-sm sm:text-base text-blue-200">
                  Showing {products.length} of {totalCount} {totalCount === 1 ? "product" : "products"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Home", onClick: onBack }, { label: category?.name || "Category" }]} />

        <FilterSort
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        {isRefreshing && (
          <p className="text-xs text-blue-600 mb-3 animate-pulse">Updating products...</p>
        )}

        {isLoading ? (
          <ProductSkeletonGrid count={8} />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={category || undefined}
                  onClick={() => handleProductClick(product.id)}
                  onHover={onPrefetchProduct}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
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
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-base sm:text-lg text-gray-500 mb-4">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
