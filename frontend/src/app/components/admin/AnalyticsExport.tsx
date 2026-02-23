import React from "react";
import { Button } from "@/app/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { toast } from "sonner";
import { Category, Product } from "@/types/catalog";

interface AnalyticsExportProps {
  products: Product[];
  categories: Category[];
}

export const AnalyticsExport: React.FC<AnalyticsExportProps> = ({
  products,
  categories,
}) => {
  const { getAnalytics } = useAnalytics();

  const exportToCSV = () => {
    const analytics = getAnalytics();
    const headers = [
      "Event Type",
      "Product ID",
      "Product Name",
      "Category ID",
      "Category Name",
      "Search Term",
      "Timestamp",
      "Session ID",
    ];

    const rows = analytics.map((event) => {
      const product = event.product_id
        ? products.find((p) => String(p.id) === event.product_id)
        : null;
      const category = event.category_id
        ? categories.find((c) => String(c.id) === event.category_id)
        : null;

      return [
        event.event_type,
        event.product_id || "",
        product?.name || "",
        event.category_id || "",
        category?.name || "",
        event.search_term || "",
        new Date(event.timestamp).toLocaleString(),
        event.session_id,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `biz-hub-analytics-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Analytics exported successfully!");
  };

  const exportToJSON = () => {
    const analytics = getAnalytics();
    const enrichedData = analytics.map((event) => {
      const product = event.product_id
        ? products.find((p) => String(p.id) === event.product_id)
        : null;
      const category = event.category_id
        ? categories.find((c) => String(c.id) === event.category_id)
        : null;

      return {
        ...event,
        product_name: product?.name,
        product_price: product?.price,
        category_name: category?.name,
      };
    });

    const jsonContent = JSON.stringify(enrichedData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `biz-hub-analytics-${new Date().toISOString().split("T")[0]}.json`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Analytics exported successfully!");
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Export JSON
      </Button>
    </div>
  );
};

