from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, TimeSlotViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'slots', TimeSlotViewSet, basename='timeslot')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]
