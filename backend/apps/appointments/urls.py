from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicAppointmentViewSet, AdminAppointmentViewSet, PublicSlotsView

router = DefaultRouter()
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointments")
router.register(r"public/appointments", PublicAppointmentViewSet, basename="public-appointments")

urlpatterns = [
    path("", include(router.urls)),
    path("public/slots/", PublicSlotsView.as_view(), name="public-slots"),
]