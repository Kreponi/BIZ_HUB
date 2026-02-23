from django.contrib import admin

from .models import AnalyticsEvent, Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name", "description")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price", "seller_name", "created_at")
    list_filter = ("category", "created_at")
    search_fields = ("name", "description", "seller_name", "seller_phone")


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "event_type",
        "product_id",
        "category_id",
        "search_term",
        "session_id",
        "timestamp",
    )
    list_filter = ("event_type", "timestamp")
    search_fields = ("product_id", "category_id", "search_term", "session_id")
