from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count
from django.db.models import ProtectedError
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnalyticsEvent, Category, Product
from .serializers import AnalyticsEventSerializer, CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Category.objects.annotate(product_count=Count("products")).order_by("-created_at")
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | Q(description__icontains=q),
            )
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if request.query_params.get("page"):
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete category with linked products."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Product.objects.select_related("category").all().order_by("-created_at")
        params = self.request.query_params

        q = params.get("q")
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
                | Q(category__name__icontains=q),
            )

        category_id = params.get("category_id")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        min_price = params.get("min_price")
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get("max_price")
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        ordering = params.get("ordering")
        allowed_ordering = {
            "price",
            "-price",
            "name",
            "-name",
            "created_at",
            "-created_at",
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if request.query_params.get("page"):
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]


class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if user is None:
            User = get_user_model()
            db_user = User.objects.filter(email=email).first()
            if db_user is not None:
                user = authenticate(
                    request,
                    username=db_user.get_username(),
                    password=password,
                )

        if user is None or not user.is_active:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_staff:
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "email": user.email or user.get_username(),
                "username": user.get_username(),
            },
            status=status.HTTP_200_OK,
        )


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMeView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        user = request.user
        return Response(
            {
                "email": user.email or user.get_username(),
                "username": user.get_username(),
            },
            status=status.HTTP_200_OK,
        )


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        events_qs = AnalyticsEvent.objects.all()

        total_page_visits = events_qs.filter(
            event_type=AnalyticsEvent.EVENT_PAGE_VISIT,
        ).count()
        total_product_clicks = events_qs.filter(
            event_type=AnalyticsEvent.EVENT_PRODUCT_CLICK,
        ).count()
        total_category_clicks = events_qs.filter(
            event_type=AnalyticsEvent.EVENT_CATEGORY_CLICK,
        ).count()
        total_searches = events_qs.filter(
            event_type=AnalyticsEvent.EVENT_SEARCH,
        ).count()
        total_whatsapp_contacts = events_qs.filter(
            event_type=AnalyticsEvent.EVENT_WHATSAPP_CONTACT,
        ).count()

        category_click_counts = {
            row["category_id"]: row["clicks"]
            for row in events_qs.filter(
                event_type=AnalyticsEvent.EVENT_CATEGORY_CLICK,
            )
            .exclude(category_id__isnull=True)
            .exclude(category_id="")
            .values("category_id")
            .annotate(clicks=Count("id"))
        }
        category_clicks = []
        for category in Category.objects.all():
            category_clicks.append(
                {
                    "category_id": category.id,
                    "name": category.name,
                    "clicks": category_click_counts.get(str(category.id), 0),
                }
            )

        product_click_rows = (
            events_qs.filter(event_type=AnalyticsEvent.EVENT_PRODUCT_CLICK)
            .exclude(product_id__isnull=True)
            .exclude(product_id="")
            .values("product_id")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        product_ids = []
        for row in product_click_rows:
            try:
                product_ids.append(int(row["product_id"]))
            except (TypeError, ValueError):
                continue
        products_by_id = Product.objects.in_bulk(product_ids)
        most_viewed_products = []
        for row in product_click_rows:
            try:
                product_id = int(row["product_id"])
            except (TypeError, ValueError):
                continue
            product = products_by_id.get(product_id)
            if not product:
                continue
            most_viewed_products.append(
                {
                    "product_id": product.id,
                    "name": product.name,
                    "price": float(product.price),
                    "count": row["count"],
                }
            )
            if len(most_viewed_products) >= 5:
                break

        return Response(
            {
                "totals": {
                    "page_visits": total_page_visits,
                    "product_clicks": total_product_clicks,
                    "category_clicks": total_category_clicks,
                    "searches": total_searches,
                    "whatsapp_contacts": total_whatsapp_contacts,
                },
                "category_clicks": category_clicks,
                "most_viewed_products": most_viewed_products,
                "database_overview": {
                    "total_products": Product.objects.count(),
                    "total_categories": Category.objects.count(),
                    "total_events": events_qs.count(),
                },
            },
            status=status.HTTP_200_OK,
        )
