from rest_framework import viewsets, generics, permissions
from .models import CustomUser, Service, TimeSlot, Appointment
from .serializers import (
    UserSerializer,
    ServiceSerializer,
    TimeSlotSerializer,
    AppointmentSerializer
)

# 获取所有服务
class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

# 获取所有时间段
class TimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

# 获取所有预约 / 创建预约
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def perform_create(self, serializer):
        # 自动绑定当前用户为预约人
        serializer.save(customer=self.request.user)
