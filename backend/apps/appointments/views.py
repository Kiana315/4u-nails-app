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
    queryset = Appointment.objects.all().select_related("technician").prefetch_related("services")

    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        return AppointmentAdminSerializer
    def perform_create(self, serializer):
        # ✅ Admin 快速创建默认 pending
        serializer.save(status="pending")
    
class PublicSlotsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from rest_framework import serializers
        class SlotQuery(serializers.Serializer):
            date = serializers.DateField()
            serviceIds = serializers.CharField(required=False)
            serviceId = serializers.IntegerField(required=False, min_value=1)
            technicianId = serializers.IntegerField(required=False, min_value=1)
        query = SlotQuery(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = query.validated_data
        try:
            ids = [int(value) for value in data['serviceIds'].split(',')] if 'serviceIds' in data else [data['serviceId']]
        except (ValueError, KeyError):
            raise serializers.ValidationError({'serviceIds': 'Select valid services.'})
        services = list(Service.objects.filter(pk__in=ids, is_active=True))
        if not ids or len(set(ids)) != len(ids) or len(services) != len(ids) or any(s.duration <= 0 for s in services):
            raise serializers.ValidationError({'serviceIds': 'Select valid, active services.'})
        technician = None
        if data.get('technicianId'):
            technician = Technician.objects.filter(pk=data['technicianId']).first()
            if technician is None:
                raise serializers.ValidationError({'technicianId': 'Technician not found.'})
        available = compute_available_slots(data['date'], services, technician=technician, step_min=15)
        return Response({
            'date': data['date'].isoformat(), 'serviceIds': ids,
            'technicianId': data.get('technicianId'),
            'durationMin': sum(s.duration for s in services), 'stepMin': 15,
            'slots': [t.strftime('%H:%M') for t in available],
        })
