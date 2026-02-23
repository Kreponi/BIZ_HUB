import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { HelpCircle, ShoppingBag, MessageCircle, BarChart3, User } from 'lucide-react';
import { ScrollArea } from '@/app/components/ui/scroll-area';

export const HelpDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            BIZ HUB Guide
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Features */}
            <section>
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                For Customers
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Browse Products:</strong> Explore 27+ products across 5 categories (shoes, clothing, tech)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Search:</strong> Use the search bar to find specific products</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Filter & Sort:</strong> On category pages, filter by price and sort products</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>View Details:</strong> Click any product to see full details, images, and seller info</span>
                </li>
              </ul>
            </section>

            {/* WhatsApp Contact */}
            <section>
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Contact Sellers via WhatsApp
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>Click the <strong>"Contact Seller on WhatsApp"</strong> button on any product page</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>A pre-filled message with product details will open in WhatsApp</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>All contacts are tracked for analytics (visible in admin dashboard)</span>
                </li>
              </ul>
            </section>

            {/* Admin Features */}
            <section>
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                Admin Dashboard Access
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-3">
                <p className="font-medium text-purple-900 mb-2 text-xs sm:text-sm">Secure Admin Login</p>
                <p className="text-xs sm:text-sm text-purple-700">
                  Use your Django admin credentials to access the dashboard.
                </p>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Click <strong>"Admin Login"</strong> in the header to access the dashboard</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>View comprehensive analytics and user behavior insights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Manage products: Add, edit, or delete products</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Manage categories: Organize your product catalog</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Export analytics data as CSV or JSON files</span>
                </li>
              </ul>
            </section>

            {/* Analytics Tracking */}
            <section>
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Analytics & Tracking
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 mb-3">
                The platform automatically tracks the following events:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span><strong>Page Visits:</strong> Every page view is recorded</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span><strong>Product Clicks:</strong> Track which products get the most attention</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span><strong>Category Clicks:</strong> See which categories are most popular</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span><strong>Search Queries:</strong> Monitor what customers are searching for</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span><strong>WhatsApp Contacts:</strong> Track seller engagement and conversion</span>
                </li>
              </ul>
            </section>

            {/* Features Overview */}
            <section>
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900 text-xs sm:text-sm">🎨 Modern UI</p>
                  <p className="text-xs text-blue-700">Card-based, responsive design</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-900 text-xs sm:text-sm">📱 Mobile-First</p>
                  <p className="text-xs text-green-700">Optimized for all devices</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-medium text-purple-900 text-xs sm:text-sm">🔍 Search & Filter</p>
                  <p className="text-xs text-purple-700">Find products quickly</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="font-medium text-orange-900 text-xs sm:text-sm">📊 Analytics</p>
                  <p className="text-xs text-orange-700">Comprehensive tracking</p>
                </div>
              </div>
            </section>

            {/* Note */}
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Note:</strong> This app uses a Django backend for authentication and data APIs.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

