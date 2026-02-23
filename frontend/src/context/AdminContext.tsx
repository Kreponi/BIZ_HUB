import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { apiRequest, invalidateApiCache } from "@/lib/api";

interface AdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  adminEmail: string | null;
}

type LoginResponse = {
  token: string;
  email: string;
  username: string;
};

type MeResponse = {
  email: string;
  username: string;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem("admin_logged_in") === "true");
  const [adminEmail, setAdminEmail] = useState<string | null>(() => localStorage.getItem("admin_email"));

  useEffect(() => {
    const verifyExistingToken = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        return;
      }

      try {
        const me = await apiRequest<MeResponse>("/auth/me/");
        setIsAdmin(true);
        setAdminEmail(me.email);
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_email", me.email);
      } catch {
        setIsAdmin(false);
        setAdminEmail(null);
        localStorage.removeItem("admin_logged_in");
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_token");
        invalidateApiCache();
      }
    };

    void verifyExistingToken();
  }, []);

  useEffect(() => {
    const syncAuthStateFromStorage = () => {
      const loggedIn = localStorage.getItem("admin_logged_in") === "true";
      const email = localStorage.getItem("admin_email");
      setIsAdmin(loggedIn);
      setAdminEmail(email);
    };

    window.addEventListener("auth-changed", syncAuthStateFromStorage);
    return () => {
      window.removeEventListener("auth-changed", syncAuthStateFromStorage);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const payload = await apiRequest<LoginResponse>("/auth/login/", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("admin_token", payload.token);
      localStorage.setItem("admin_logged_in", "true");
      localStorage.setItem("admin_email", payload.email);
      invalidateApiCache();
      setIsAdmin(true);
      setAdminEmail(payload.email);
      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error("Unable to sign in right now. Please try again.");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest<void>("/auth/logout/", { method: "POST" });
    } catch {
      // Clear local auth state even if backend logout fails.
    } finally {
      setIsAdmin(false);
      setAdminEmail(null);
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_token");
      invalidateApiCache();
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  return <AdminContext.Provider value={{ isAdmin, login, logout, adminEmail }}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
