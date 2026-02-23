import React from 'react';
import { ShoppingBag, Package } from 'lucide-react';

interface StatsBarProps {
  totalProducts: number;
  totalCategories: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalProducts, totalCategories }) => {
  const stats = [
    {
      icon: Package,
      value: `${totalProducts}+`,
      label: 'Premium Products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: ShoppingBag,
      value: `${totalCategories}`,
      label: 'Categories',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Package,
      value: `${totalProducts}`,
      label: 'Verified Products',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white border-y py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${stat.bgColor} rounded-full mb-2 sm:mb-3 md:mb-4`}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-600 text-xs sm:text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
