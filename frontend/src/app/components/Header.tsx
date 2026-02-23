import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { useAnalytics } from "@/context/AnalyticsContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNavigate,
  currentPage: _currentPage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { trackEvent } = useAnalytics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackEvent("search", { search_term: searchQuery });
      onSearch?.(searchQuery);
    }
  };

  const handleLogoClick = () => {
    onNavigate("home");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <img
              src="/bizhub_logo.jpeg"
              alt="Biz Hub Logo"
              className="h-12 w-12 sm:h-14 sm:w-14"
            />
            <h1 className="font-bold text-lg sm:text-2xl">BIZ HUB</h1>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>

          <div />
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </form>
      </div>
    </header>
  );
};
