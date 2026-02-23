import React, { useEffect, useState } from 'react';
import { Product, Category } from '@/types/catalog';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { formatGhs } from '@/lib/currency';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category: Category | undefined;
  onClick: () => void;
  onHover?: () => void;
  formatPrice?: (price: number) => string;
  enableCarousel?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onClick,
  onHover,
  formatPrice,
  enableCarousel = false,
}) => {
  const numericPrice = Number(product.price);
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasCarousel = enableCarousel && product.images.length > 1;
  const imageList =
    product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"];
  const imageSrc = imageList[currentImageIndex] || imageList[0];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden group"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <ImageWithFallback
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {hasCarousel && (
          <>
            <button
              type="button"
              onClick={handlePreviousImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {imageList.map((_, idx) => (
                <button
                  key={`${product.id}-dot-${idx}`}
                  type="button"
                  aria-label={`View image ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{product.name}</h3>
          {category && (
            <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
              {category.name}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">{product.description}</p>
        <div className="flex items-center">
          <span className="text-lg sm:text-xl font-bold text-blue-600">
            {formatPrice ? formatPrice(safePrice) : formatGhs(safePrice)}
          </span>
        </div>
      </div>
    </Card>
  );
};
