from rest_framework import viewsets, mixins, permissions
from apps.core.permissions import IsAdmin

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentAdminSerializer


class PublicAppointmentViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    顾客/店员都可用：创建预约（不要求登录）
    """
    serializer_class = AppointmentCreateSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Appointment.objects.all()  # CreateModelMixin 需要 queryset


class AdminAppointmentViewSet(viewsets.ModelViewSet):
    """
    管理员：查看/编辑/确认/取消 等
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentAdminSerializer
    permission_classes = [IsAdmin]
