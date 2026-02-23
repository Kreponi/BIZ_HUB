import React from 'react';
import { ProductCard } from './ProductCard';
import { Product, Category } from '@/types/catalog';

interface RelatedProductsProps {
  currentProductId: number;
  categoryId: number;
  products: Product[];
  onNavigateToProduct: (productId: string) => void;
  getCategoryById: (categoryId: number) => Category | undefined;
  onPrefetchProduct?: () => void;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProductId,
  categoryId,
  products,
  onNavigateToProduct,
  getCategoryById,
  onPrefetchProduct,
}) => {
  const relatedProducts = products
    .filter((p) => p.category_id === categoryId && p.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            category={getCategoryById(product.category_id)}
            onClick={() => onNavigateToProduct(String(product.id))}
            onHover={onPrefetchProduct}
          />
        ))}
      </div>
    </div>
  );
};
