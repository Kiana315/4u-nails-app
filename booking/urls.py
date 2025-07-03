from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
# router.register(r'slots', TimeSlotViewSet, basename='timeslot')
# router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # 登录用
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # 刷新用
    path('technicians/', technician_list, name='technician-list'),
    
]
