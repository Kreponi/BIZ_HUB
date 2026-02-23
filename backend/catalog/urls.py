from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    AnalyticsSummaryView,
    AnalyticsEventViewSet,
    CategoryViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"analytics-events", AnalyticsEventViewSet, basename="analytics-events")

urlpatterns = [
    path("auth/login/", AdminLoginView.as_view(), name="auth-login"),
    path("auth/logout/", AdminLogoutView.as_view(), name="auth-logout"),
    path("auth/me/", AdminMeView.as_view(), name="auth-me"),
    path("analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
]

urlpatterns += router.urls
