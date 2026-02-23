import React, { useEffect, useState } from "react";
import { CategoryCard } from "./CategoryCard";
import { ProductCard } from "./ProductCard";
import { useAnalytics } from "@/context/AnalyticsContext";
import { StatsBar } from "./StatsBar";
import { apiRequest, isAbortError } from "@/lib/api";
import { formatGhs } from "@/lib/currency";
import { Category, Product } from "@/types/catalog";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import { Footprints, ShoppingBag, Smartphone } from "lucide-react";

interface LandingPageProps {
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToProduct: (productId: string) => void;
  searchQuery?: string;
  onPrefetchCategory?: () => void;
  onPrefetchProduct?: () => void;
}

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToCategory,
  onNavigateToProduct,
  searchQuery,
  onPrefetchCategory,
  onPrefetchProduct,
}) => {
  const { trackEvent } = useAnalytics();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    trackEvent("page_visit");
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      const isFirstLoad = categories.length === 0 && products.length === 0;
      try {
        if (isFirstLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        const categoriesPage = await apiRequest<PaginatedResponse<Category>>("/categories/?page=1", {
          cacheTtlMs: 15000,
          signal: controller.signal,
        });
        setCategories(categoriesPage.results);

        const params = new URLSearchParams({ page: "1", ordering: "-created_at" });
        if (searchQuery?.trim()) {
          params.set("q", searchQuery.trim());
        }

        const productsPage = await apiRequest<PaginatedResponse<Product>>(`/products/?${params.toString()}`, {
          cacheTtlMs: 10000,
          signal: controller.signal,
        });
        setProducts(productsPage.results);
        setResultCount(productsPage.count);

        if (searchQuery?.trim()) {
          const totalPage = await apiRequest<PaginatedResponse<Product>>("/products/?page=1", {
            cacheTtlMs: 10000,
            signal: controller.signal,
          });
          setTotalProducts(totalPage.count);
        } else {
          setTotalProducts(productsPage.count);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          setProducts([]);
          setResultCount(0);
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

    void loadData();
    return () => {
      controller.abort();
    };
  }, [searchQuery]);

  const handleCategoryClick = (categoryId: number) => {
    trackEvent("category_click", { category_id: String(categoryId) });
    onNavigateToCategory(String(categoryId));
  };

  const handleProductClick = (productId: number) => {
    trackEvent("product_click", { product_id: String(productId) });
    onNavigateToProduct(String(productId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden text-white py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#06142f] via-[#0a2560] to-[#1d4ed8]">
        <style>{`
          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes heroDrift {
            0%, 100% { transform: translateX(0px); opacity: 0.35; }
            50% { transform: translateX(12px); opacity: 0.55; }
          }
          .hero-float {
            animation: heroFloat 6s ease-in-out infinite;
          }
          .hero-drift {
            animation: heroDrift 8s ease-in-out infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-white/15" />
        <div className="absolute -top-14 -left-10 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl hero-drift" />
        <div className="absolute -bottom-16 right-4 h-72 w-72 rounded-full bg-cyan-200/15 blur-3xl hero-drift" style={{ animationDelay: "1.4s" }} />

        <div className="absolute left-[-8%] top-[64%] sm:top-[60%] h-40 w-[120%] rounded-[100%] border border-white/10 blur-[1px]" />
        <div className="absolute left-[-8%] top-[74%] sm:top-[70%] h-40 w-[120%] rounded-[100%] border border-white/10 blur-[1px]" />

        <Footprints className="hidden md:block absolute left-[8%] top-[24%] h-16 w-16 text-white/25 blur-[1px] hero-float" />
        <Smartphone className="hidden md:block absolute right-[11%] top-[28%] h-14 w-14 text-white/25 blur-[1px] hero-float" style={{ animationDelay: "1.2s" }} />
        <ShoppingBag className="hidden md:block absolute right-[20%] bottom-[18%] h-16 w-16 text-white/25 blur-[1px] hero-float" style={{ animationDelay: "2.3s" }} />

        <div className="absolute left-[22%] top-[30%] h-2 w-2 rounded-full bg-white/50 hero-drift" />
        <div className="hidden sm:block absolute left-[68%] top-[22%] h-1.5 w-1.5 rounded-full bg-cyan-100/60 hero-drift" style={{ animationDelay: "0.7s" }} />
        <div className="hidden sm:block absolute left-[58%] top-[62%] h-2 w-2 rounded-full bg-blue-100/50 hero-drift" style={{ animationDelay: "1.1s" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto rounded-3xl border border-white/20 bg-white/12 backdrop-blur-md shadow-[0_24px_80px_rgba(4,17,48,0.45)] px-6 py-10 sm:px-10 sm:py-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
              Welcome to BIZ HUB
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-4 sm:mb-6">
              Your one-stop marketplace for everything you need
            </p>
            <p className="text-base sm:text-lg text-blue-100/95 max-w-3xl mx-auto px-4">
              Browse our collection of shoes, clothing, and tech products and more
            </p>
          </div>
        </div>
      </section>

      {!searchQuery && (
        <StatsBar totalProducts={totalProducts} totalCategories={categories.length} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {searchQuery && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Found {resultCount} {resultCount === 1 ? "product" : "products"}
            </p>
            {isRefreshing && (
              <p className="text-xs text-blue-600 mt-2 animate-pulse">Updating results...</p>
            )}
          </div>
        )}

        {!searchQuery && (
          <section className="mb-10 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category.id)}
                  onHover={onPrefetchCategory}
                  productCount={category.product_count || 0}
                />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <ProductSkeletonGrid count={8} />
        ) : products.length > 0 ? (
          <section className="mb-10 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                {searchQuery ? "Matching Products" : "Latest Products"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categories.find((c) => c.id === product.category_id)}
                  onClick={() => handleProductClick(product.id)}
                  onHover={onPrefetchProduct}
                  formatPrice={formatGhs}
                  enableCarousel
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              No products found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-10 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">About BIZ HUB</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Your trusted marketplace for shoes, clothing, and tech. 
              </p>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Categories</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      onMouseEnter={onPrefetchCategory}
                      onFocus={onPrefetchCategory}
                      className="hover:text-white transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact</h3>
              <p className="text-sm sm:text-base text-gray-400">
                 Have any  questions? <br />
               Reach out to our customer service team directly via WhatsApp from any product page.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2026 BIZ HUB. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
