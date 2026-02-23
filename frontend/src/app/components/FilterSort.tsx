import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

interface FilterSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const FilterSort: React.FC<FilterSortProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sort" className="text-xs sm:text-sm font-medium whitespace-nowrap">
          Sort by:
        </Label>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger id="sort" className="w-[150px] sm:w-[180px] text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Filter Button */}
      <div className="ml-auto hidden md:flex" />
    </div>
  );
};
