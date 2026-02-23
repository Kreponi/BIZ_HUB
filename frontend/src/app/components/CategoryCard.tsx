import React, { useEffect, useMemo, useState } from 'react';
import { Category } from '@/types/catalog';
import { Card } from '@/app/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  onHover?: () => void;
  productCount: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  onHover,
  productCount,
}) => {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [category.image]);

  const imageUrl = useMemo(() => {
    if (!category.image) {
      return null;
    }
    if (
      category.image.startsWith('http://') ||
      category.image.startsWith('https://') ||
      category.image.startsWith('data:')
    ) {
      return category.image;
    }
    if (category.image.startsWith('/')) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const backendBase = apiBase.replace(/\/api\/?$/, '');
      return `${backendBase}${category.image}`;
    }
    return category.image;
  }, [category.image]);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white border-blue-100"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="mb-3 sm:mb-4">
          {imageUrl && !imageLoadFailed ? (
            <img
              src={imageUrl}
              alt={category.name}
              className="w-full h-28 sm:h-32 object-cover rounded-md border border-blue-100"
              loading="lazy"
              onError={() => setImageLoadFailed(true)}
            />
          ) : (
            <div className="w-full h-28 sm:h-32 rounded-md border border-blue-100 bg-gradient-to-br from-blue-100 to-blue-50" />
          )}
        </div>
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-base sm:text-lg">{category.name}</h3>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2">{category.description}</p>
        <div className="text-xs sm:text-sm text-blue-600 font-medium">
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </div>
      </div>
    </Card>
  );
};
