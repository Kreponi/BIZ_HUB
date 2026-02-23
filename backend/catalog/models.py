from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    images = models.JSONField(default=list, blank=True)
    seller_phone = models.CharField(max_length=32)
    seller_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class AnalyticsEvent(models.Model):
    EVENT_PAGE_VISIT = "page_visit"
    EVENT_PRODUCT_CLICK = "product_click"
    EVENT_CATEGORY_CLICK = "category_click"
    EVENT_SEARCH = "search"
    EVENT_WHATSAPP_CONTACT = "whatsapp_contact"

    EVENT_TYPE_CHOICES = [
        (EVENT_PAGE_VISIT, "Page Visit"),
        (EVENT_PRODUCT_CLICK, "Product Click"),
        (EVENT_CATEGORY_CLICK, "Category Click"),
        (EVENT_SEARCH, "Search"),
        (EVENT_WHATSAPP_CONTACT, "WhatsApp Contact"),
    ]

    event_type = models.CharField(max_length=32, choices=EVENT_TYPE_CHOICES)
    product_id = models.CharField(max_length=64, blank=True, null=True)
    category_id = models.CharField(max_length=64, blank=True, null=True)
    search_term = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField()
    session_id = models.CharField(max_length=128)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.event_type} @ {self.timestamp.isoformat()}"
