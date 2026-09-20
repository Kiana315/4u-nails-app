from rest_framework import mixins, viewsets
from .models import CustomUser, Service, TimeSlot, Appointment
from .serializers import (
    PublicTechnicianSerializer,
    GuestAppointmentSerializer,
    ServiceSerializer,
    TimeSlotSerializer,
)
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

# 获取所有服务
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    def get_permissions(self):
        return [AllowAny()] if self.action in ('list', 'retrieve') else [IsAdminUser()]

# 获取所有时间段
class TimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

# 游客只能创建预约；查询和修改由 Django Admin 管理
class AppointmentViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Appointment.objects.all()
    serializer_class = GuestAppointmentSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def technician_list(request):
    technicians = CustomUser.objects.filter(role='technician', is_active=True)
    serializer = PublicTechnicianSerializer(technicians, many=True)
    return Response(serializer.data)
