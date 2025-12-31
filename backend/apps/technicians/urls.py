from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicTechnicianViewSet, AdminTechnicianViewSet

router = DefaultRouter()
router.register(r"technicians", PublicTechnicianViewSet, basename="public-technician")
router.register(r"admin/technicians", AdminTechnicianViewSet, basename="admin-technician")

urlpatterns = [
    path("", include(router.urls)),
]
