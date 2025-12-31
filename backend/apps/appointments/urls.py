from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicAppointmentViewSet, AdminAppointmentViewSet

router = DefaultRouter()
router.register(r"appointments", PublicAppointmentViewSet, basename="public-appointments")
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointments")

urlpatterns = [
    path("", include(router.urls)),
]