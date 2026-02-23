import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, MessageCircle, User, DollarSign } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { RelatedProducts } from "./RelatedProducts";
import { Breadcrumbs } from "./Breadcrumbs";
import { apiRequest, isAbortError } from "@/lib/api";
import { formatGhs } from "@/lib/currency";
import { Category, Product } from "@/types/catalog";
import { Skeleton } from "@/app/components/ui/skeleton";

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onNavigateToProduct?: (productId: string) => void;
  onPrefetchProduct?: () => void;
}

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onNavigateToProduct,
  onPrefetchProduct,
}) => {
  const { trackEvent } = useAnalytics();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const numericProductId = Number(productId);

  useEffect(() => {
    trackEvent("page_visit");
    setSelectedImage(0);
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      try {
        setIsLoading(true);
        const productData = await apiRequest<Product>(`/products/${numericProductId}/`, {
          cacheTtlMs: 15000,
          signal: controller.signal,
        });
        setProduct(productData);

        const [categoryData, relatedPage] = await Promise.all([
          apiRequest<Category>(`/categories/${productData.category_id}/`, {
            cacheTtlMs: 15000,
            signal: controller.signal,
          }),
          apiRequest<PaginatedResponse<Product>>(
            `/products/?page=1&category_id=${productData.category_id}&ordering=-created_at`,
            { cacheTtlMs: 10000, signal: controller.signal },
          ),
        ]);

        setCategory(categoryData);
        setRelatedProducts(
          relatedPage.results.filter((p) => p.id !== productData.id).slice(0, 4),
        );
      } catch (error) {
        if (!isAbortError(error)) {
          setProduct(null);
          setCategory(null);
          setRelatedProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    void loadData();
    return () => {
      controller.abort();
    };
  }, [numericProductId]);

  const handleWhatsAppClick = () => {
    if (!product) return;

    trackEvent("whatsapp_contact", { product_id: String(product.id) });
    const currentUrl = window.location.href;
    const rawImageUrl = product.images[0] || "";
    const imageUrl = /^https?:\/\//i.test(rawImageUrl) ? rawImageUrl : "";
    const message = encodeURIComponent(
      [
        `Hello BizHub! I'm interested in this product.`,
        `Name: ${product.name}`,
        `Price: ${formatGhs(product.price)}`,
        `Description: ${product.description}`,
        imageUrl ? `Image: ${imageUrl}` : "",
        `Product link: ${currentUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    const whatsappUrl = `https://wa.me/233552388607?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const getCategoryById = (categoryId: number): Category | undefined => {
    if (category && category.id === categoryId) {
      return category;
    }
    return undefined;
  };

  if (!isLoading && (!product || !category)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !product || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
              <div>
                <Skeleton className="aspect-square w-full rounded-lg mb-4" />
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={`thumb-skeleton-${idx}`} className="aspect-square w-full rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-full max-w-[20rem] mb-3" />
                <Skeleton className="h-10 w-full max-w-[10rem] mb-6" />
                <Skeleton className="h-5 w-28 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-11/12 mb-2" />
                <Skeleton className="h-4 w-4/5 mb-6" />
                <Skeleton className="h-32 w-full rounded-lg mb-6" />
                <Skeleton className="h-14 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = product.images[selectedImage] || product.images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs
          items={[{ label: "Home", onClick: onBack }, { label: category.name }, { label: product.name }]}
        />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <ImageWithFallback src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-blue-600 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-4">
                <Badge className="mb-3">{category.name}</Badge>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {formatGhs(product.price)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h2 className="font-semibold text-base sm:text-lg mb-3">Description</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <Button
                size="lg"
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 text-base sm:text-lg py-5 sm:py-6"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                Contact us on WhatsApp
              </Button>

              <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center">
                Tap to contact us about this product via whatsapp. 
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Why Buy from BIZ HUB?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col items-center text-center p-3 sm:p-4">
              <div className="bg-blue-100 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Direct Contact</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Connect directly with us via WhatsApp for instant communication
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4">
              <div className="bg-green-100 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Best Prices</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Best  Prices 
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4">
              <div className="bg-purple-100 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Verified Products</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
               All products on Biz Hub have been verified by our team to ensure quality and authenticity
              </p>
            </div>
          </div>
        </div>

        {onNavigateToProduct && (
          <RelatedProducts
            currentProductId={product.id}
            categoryId={product.category_id}
            products={relatedProducts}
            onNavigateToProduct={onNavigateToProduct}
            getCategoryById={getCategoryById}
            onPrefetchProduct={onPrefetchProduct}
          />
        )}
      </div>
    </div>
  );
};
