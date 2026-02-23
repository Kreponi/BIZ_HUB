import React, { useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useAdmin } from "@/context/AdminContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  TrendingUp,
  Eye,
  MousePointer,
  Search,
  MessageCircle,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { ProductManagement } from "./admin/ProductManagement";
import { CategoryManagement } from "./admin/CategoryManagement";
import { AnalyticsExport } from "./admin/AnalyticsExport";
import { apiRequest } from "@/lib/api";
import { Category, Product } from "@/types/catalog";

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

type AnalyticsSummary = {
  totals: {
    page_visits: number;
    product_clicks: number;
    category_clicks: number;
    searches: number;
    whatsapp_contacts: number;
  };
  category_clicks: Array<{
    category_id: number;
    name: string;
    clicks: number;
  }>;
  most_viewed_products: Array<{
    product_id: number;
    name: string;
    price: number;
    count: number;
  }>;
  database_overview: {
    total_products: number;
    total_categories: number;
    total_events: number;
  };
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onLogout }) => {
  const { getAnalytics } = useAnalytics();
  const { adminEmail, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cediFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }),
    [],
  );

  const analytics = getAnalytics();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [productsData, categoriesData] = await Promise.all([
          apiRequest<Product[]>("/products/"),
          apiRequest<Category[]>("/categories/"),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        try {
          const summaryData = await apiRequest<AnalyticsSummary>("/analytics/summary/");
          setSummary(summaryData);
        } catch {
          setSummary(null);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadData();
  }, []);

  const totalPageVisits = analytics.filter((e) => e.event_type === "page_visit").length;
  const totalProductClicks = analytics.filter((e) => e.event_type === "product_click").length;
  const totalCategoryClicks = analytics.filter((e) => e.event_type === "category_click").length;
  const totalSearches = analytics.filter((e) => e.event_type === "search").length;
  const totalWhatsAppContacts = analytics.filter((e) => e.event_type === "whatsapp_contact").length;
  const displayTotalPageVisits = summary?.totals.page_visits ?? totalPageVisits;
  const displayTotalProductClicks = summary?.totals.product_clicks ?? totalProductClicks;
  const displayTotalCategoryClicks = summary?.totals.category_clicks ?? totalCategoryClicks;
  const displayTotalSearches = summary?.totals.searches ?? totalSearches;
  const displayTotalWhatsAppContacts =
    summary?.totals.whatsapp_contacts ?? totalWhatsAppContacts;

  const productClickCounts = analytics
    .filter((e) => e.event_type === "product_click" && e.product_id)
    .reduce((acc, event) => {
      const productId = event.product_id!;
      acc[productId] = (acc[productId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const mostViewedProducts = Object.entries(productClickCounts)
    .map(([productId, count]) => {
      const product = products.find((p) => String(p.id) === productId);
      return product ? { product, count } : null;
    })
    .filter((item): item is { product: Product; count: number } => item !== null)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const categoryClickData =
    summary?.category_clicks && summary.category_clicks.length > 0
      ? summary.category_clicks.map((item) => ({
          name: item.name,
          clicks: item.clicks,
        }))
      : categories.map((category) => ({
          name: category.name,
          clicks: analytics.filter(
            (e) => e.event_type === "category_click" && e.category_id === String(category.id),
          ).length,
        }));

  const eventTypeData = [
    { name: "Page Visits", value: displayTotalPageVisits },
    { name: "Product Clicks", value: displayTotalProductClicks },
    { name: "Category Clicks", value: displayTotalCategoryClicks },
    { name: "Searches", value: displayTotalSearches },
    { name: "WhatsApp Contacts", value: displayTotalWhatsAppContacts },
  ].filter((item) => item.value > 0);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="self-start text-white hover:text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                void handleLogout();
              }}
              disabled={isLoggingOut}
              className="self-start text-white hover:text-white hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
            <div className="hidden sm:block border-l h-6" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-blue-100">Logged in as: {adminEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 sm:mb-8 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FolderTree className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{displayTotalPageVisits}</p>
                <p className="text-xs sm:text-sm text-gray-600">Page Visits</p>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <MousePointer className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{displayTotalProductClicks}</p>
                <p className="text-xs sm:text-sm text-gray-600">Product Views</p>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <FolderTree className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{displayTotalCategoryClicks}</p>
                <p className="text-xs sm:text-sm text-gray-600">Category Clicks</p>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{displayTotalSearches}</p>
                <p className="text-xs sm:text-sm text-gray-600">Searches</p>
              </Card>

              <Card className="p-4 sm:p-6 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{displayTotalWhatsAppContacts}</p>
                <p className="text-xs sm:text-sm text-gray-600">WhatsApp Contacts</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Category Clicks</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryClickData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Event Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Most Viewed Products
                </h3>
                {summary?.most_viewed_products && summary.most_viewed_products.length > 0 ? (
                  <div className="space-y-3">
                    {summary.most_viewed_products.map((product, index) => (
                      <div
                        key={product.product_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400 text-lg">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {cediFormatter.format(product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{product.count}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : mostViewedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {mostViewedProducts.map(({ product, count }, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400 text-lg">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {cediFormatter.format(product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{count}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available yet</p>
                )}
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Database Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">
                    {summary?.database_overview.total_products ?? products.length}
                  </p>
                  <p className="text-gray-600 mt-2">Total Products</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">
                    {summary?.database_overview.total_categories ?? categories.length}
                  </p>
                  <p className="text-gray-600 mt-2">Total Categories</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-4xl font-bold text-purple-600">
                    {summary?.database_overview.total_events ?? analytics.length}
                  </p>
                  <p className="text-gray-600 mt-2">Total Events Tracked</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics Export</h3>
              <AnalyticsExport products={products} categories={categories} />
              {isLoadingData && (
                <p className="text-sm text-gray-500 mt-3">Loading catalog data for analytics...</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
