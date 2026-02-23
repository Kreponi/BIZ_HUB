from rest_framework import serializers

from .models import AnalyticsEvent, Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "image", "product_count", "created_at"]
        read_only_fields = ["id", "created_at", "product_count"]


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
    )
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category_id",
            "category_name",
            "images",
            "seller_phone",
            "seller_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category_name"]


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = [
            "id",
            "event_type",
            "product_id",
            "category_id",
            "search_term",
            "timestamp",
            "session_id",
        ]
        read_only_fields = ["id"]
