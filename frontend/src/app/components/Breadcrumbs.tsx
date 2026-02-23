import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 flex-wrap">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Home className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Home</span>
      </button>
      
      {items.slice(1).map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};