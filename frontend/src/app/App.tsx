import React, { Suspense, lazy, useEffect, useState } from "react";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { Header } from "@/app/components/Header";
import { LandingPage } from "@/app/components/LandingPage";
import { Toaster } from "@/app/components/ui/sonner";
import { toast } from "sonner";
import SplashScreen from "@/app/components/SplashScreen";
import {
  preloadAdminDashboard,
  preloadAdminLogin,
  preloadCategoryPage,
  preloadProductDetailPage,
} from "@/app/routePrefetch";

const CategoryPage = lazy(() =>
  preloadCategoryPage().then((mod) => ({
    default: mod.CategoryPage,
  })),
);
const ProductDetailPage = lazy(() =>
  preloadProductDetailPage().then((mod) => ({
    default: mod.ProductDetailPage,
  })),
);
const AdminLogin = lazy(() =>
  preloadAdminLogin().then((mod) => ({
    default: mod.AdminLogin,
  })),
);
const AdminDashboard = lazy(() =>
  preloadAdminDashboard().then((mod) => ({
    default: mod.AdminDashboard,
  })),
);

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const ADMIN_ACTIVITY_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

type Page =
  | { type: "home" }
  | { type: "category"; categoryId: string }
  | { type: "product"; productId: string }
  | { type: "admin-login" }
  | { type: "admin" };

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
  </div>
);

const AppShell: React.FC = () => {
  const { isAdmin, logout } = useAdmin();
  const [currentPage, setCurrentPage] = useState<Page>({ type: "home" });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === "/admin") {
        if (isAdmin) {
          setCurrentPage({ type: "admin" });
        } else {
          setCurrentPage({ type: "admin-login" });
          window.history.replaceState(null, "", "/admin-login");
        }
      } else if (path === "/admin-login") {
        setCurrentPage({ type: "admin-login" });
      } else if (path.startsWith("/category/")) {
        const categoryId = path.split("/category/")[1];
        if (categoryId) {
          setCurrentPage({ type: "category", categoryId });
        }
      } else if (path.startsWith("/product/")) {
        const productId = path.split("/product/")[1];
        if (productId) {
          setCurrentPage({ type: "product", productId });
        }
      } else {
        setCurrentPage({ type: "home" });
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (currentPage.type !== "admin" || !isAdmin) {
      return;
    }

    let timeoutId: number | null = null;

    const handleIdleLogout = () => {
      void (async () => {
        await logout();
        setCurrentPage({ type: "admin-login" });
        window.history.replaceState(null, "", "/admin-login");
        toast.info("Session expired after 10 minutes of inactivity. Please sign in again.");
      })();
    };

    const resetIdleTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleIdleLogout, IDLE_TIMEOUT_MS);
    };

    resetIdleTimer();
    ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
    };
  }, [currentPage.type, isAdmin, logout]);

  const handleNavigate = (page: string, id?: string) => {
    switch (page) {
      case "home":
        setCurrentPage({ type: "home" });
        setSearchQuery("");
        window.history.pushState(null, "", "/");
        break;
      case "category":
        if (id) {
          setCurrentPage({ type: "category", categoryId: id });
          window.history.pushState(null, "", `/category/${id}`);
        }
        break;
      case "product":
        if (id) {
          setCurrentPage({ type: "product", productId: id });
          window.history.pushState(null, "", `/product/${id}`);
        }
        break;
      case "admin-login":
        setCurrentPage({ type: "admin-login" });
        window.history.pushState(null, "", "/admin-login");
        break;
      case "admin":
        if (isAdmin) {
          setCurrentPage({ type: "admin" });
          window.history.pushState(null, "", "/admin");
        } else {
          setCurrentPage({ type: "admin-login" });
          window.history.pushState(null, "", "/admin-login");
        }
        break;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage({ type: "home" });
  };

  const renderPage = () => {
    switch (currentPage.type) {
      case "home":
        return (
          <>
            <Header
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              currentPage="home"
            />
            <LandingPage
              onNavigateToCategory={(id) => handleNavigate("category", id)}
              onNavigateToProduct={(id) => handleNavigate("product", id)}
              searchQuery={searchQuery}
              onPrefetchCategory={() => {
                void preloadCategoryPage();
              }}
              onPrefetchProduct={() => {
                void preloadProductDetailPage();
              }}
            />
          </>
        );

      case "category":
        return (
          <>
            <Header
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              currentPage="category"
            />
            <Suspense fallback={<RouteFallback />}>
              <CategoryPage
                categoryId={currentPage.categoryId}
                onNavigateToProduct={(id) => handleNavigate("product", id)}
                onBack={() => handleNavigate("home")}
                onPrefetchProduct={() => {
                  void preloadProductDetailPage();
                }}
              />
            </Suspense>
          </>
        );

      case "product":
        return (
          <>
            <Header
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              currentPage="product"
            />
            <Suspense fallback={<RouteFallback />}>
              <ProductDetailPage
                productId={currentPage.productId}
                onBack={() => handleNavigate("home")}
                onNavigateToProduct={(id) => handleNavigate("product", id)}
                onPrefetchProduct={() => {
                  void preloadProductDetailPage();
                }}
              />
            </Suspense>
          </>
        );

      case "admin-login":
        return (
          <Suspense fallback={<RouteFallback />}>
            <AdminLogin
              onLoginSuccess={() => handleNavigate("admin")}
              onBack={() => handleNavigate("home")}
            />
          </Suspense>
        );

      case "admin":
        if (!isAdmin) {
          return (
            <Suspense fallback={<RouteFallback />}>
              <AdminLogin
                onLoginSuccess={() => handleNavigate("admin")}
                onBack={() => handleNavigate("home")}
              />
            </Suspense>
          );
        }

        return (
          <Suspense fallback={<RouteFallback />}>
            <AdminDashboard
              onBack={() => handleNavigate("home")}
              onLogout={() => handleNavigate("admin-login")}
            />
          </Suspense>
        );

      default:
        return null;
    }
  };

  return (
    <AnalyticsProvider>
      <div className="min-h-screen bg-gray-50">
        {showSplash ? <SplashScreen /> : renderPage()}
        <Toaster position="top-right" />
      </div>
    </AnalyticsProvider>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AppShell />
    </AdminProvider>
  );
}


