from rest_framework import viewsets, permissions
from .models import Service
from .serializers import ServiceSerializer
from apps.core.permissions import IsAdmin

class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    给顾客用的服务列表（只看、只显示 active）
    """
    queryset = Service.objects.filter(is_active=True).order_by("name")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class AdminServiceViewSet(viewsets.ModelViewSet):
    """
    给管理员用的完整 CRUD
    """
    queryset = Service.objects.all().order_by("name")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdmin]