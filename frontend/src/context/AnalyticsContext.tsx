import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export interface AnalyticsEvent {
  id: string;
  event_type:
    | "page_visit"
    | "product_click"
    | "category_click"
    | "search"
    | "whatsapp_contact";
  product_id?: string;
  category_id?: string;
  search_term?: string;
  timestamp: string;
  session_id: string;
}

interface AnalyticsContextType {
  trackEvent: (
    eventType: AnalyticsEvent["event_type"],
    data?: {
      product_id?: string;
      category_id?: string;
      search_term?: string;
    },
  ) => void;
  getAnalytics: () => AnalyticsEvent[];
}

type AnalyticsEventApi = {
  id: number;
  event_type: AnalyticsEvent["event_type"];
  product_id: string | null;
  category_id: string | null;
  search_term: string | null;
  timestamp: string;
  session_id: string;
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

const normalizeEvent = (event: AnalyticsEventApi): AnalyticsEvent => ({
  id: String(event.id),
  event_type: event.event_type,
  product_id: event.product_id || undefined,
  category_id: event.category_id || undefined,
  search_term: event.search_term || undefined,
  timestamp: event.timestamp,
  session_id: event.session_id,
});

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    const hasAdminToken = () => Boolean(localStorage.getItem("admin_token"));

    const loadEvents = async () => {
      if (!hasAdminToken()) {
        setAnalyticsEvents([]);
        return;
      }
      try {
        const events = await apiRequest<AnalyticsEventApi[]>("/analytics-events/");
        setAnalyticsEvents(events.map(normalizeEvent));
      } catch {
        // Keep local analytics empty if backend is unavailable.
      }
    };

    const handleAuthChange = () => {
      void loadEvents();
    };

    void loadEvents();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const trackEvent = (
    eventType: AnalyticsEvent["event_type"],
    data?: {
      product_id?: string;
      category_id?: string;
      search_term?: string;
    },
  ) => {
    const event: AnalyticsEvent = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_type: eventType,
      product_id: data?.product_id,
      category_id: data?.category_id,
      search_term: data?.search_term,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
    };

    setAnalyticsEvents((prev) => [event, ...prev]);

    void apiRequest<AnalyticsEventApi>("/analytics-events/", {
      method: "POST",
      body: {
        event_type: event.event_type,
        product_id: event.product_id || null,
        category_id: event.category_id || null,
        search_term: event.search_term || null,
        timestamp: event.timestamp,
        session_id: event.session_id,
      },
    });
  };

  const getAnalytics = () => analyticsEvents;

  return (
    <AnalyticsContext.Provider value={{ trackEvent, getAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
