from rest_framework import viewsets, permissions
from .models import Technician
from .serializers import TechnicianSerializer
from apps.core.permissions import IsAdmin

class PublicTechnicianViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Technician.objects.filter(active=True).order_by("name")
    serializer_class = TechnicianSerializer
    permission_classes = [permissions.AllowAny]

class AdminTechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all().order_by("name")
    serializer_class = TechnicianSerializer
    permission_classes = [IsAdmin]
