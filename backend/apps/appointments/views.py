from rest_framework import viewsets, mixins, permissions
from apps.core.permissions import IsAdmin

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentAdminSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils.dateparse import parse_date
from apps.services.models import Service
from apps.technicians.models import Technician
from .selectors import compute_available_slots

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

class PublicSlotsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        date_str = request.query_params.get("date")
        service_id = request.query_params.get("serviceId")  # 前端现在叫 serviceId
        tech_id = request.query_params.get("technicianId")  # 可选

        date_obj = parse_date(date_str) if date_str else None
        if not date_obj or not service_id:
            return Response({"detail": "date and serviceId are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = Service.objects.get(pk=service_id)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        technician = None
        if tech_id:
            try:
                technician = Technician.objects.get(pk=tech_id)
            except Technician.DoesNotExist:
                return Response({"detail": "Technician not found"}, status=status.HTTP_404_NOT_FOUND)

        slots = compute_available_slots(date_obj, service, technician=technician, step_min=30)

        return Response({
            "date": date_obj.isoformat(),
            "serviceId": str(service_id),
            "technicianId": str(tech_id) if tech_id else None,
            "stepMin": 30,
            "slots": [t.strftime("%H:%M") for t in slots],
        })