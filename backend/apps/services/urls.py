from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicServiceViewSet, AdminServiceViewSet

router = DefaultRouter()
router.register(r"services", PublicServiceViewSet, basename="public-service")
router.register(r"admin/services", AdminServiceViewSet, basename="admin-service")

urlpatterns = [
    path("", include(router.urls)),
]