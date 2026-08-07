from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import IsAdmin
from .models import ScheduleConfigModel
from .serializers import ScheduleConfigSerializer

class AdminScheduleView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        cfg = ScheduleConfigModel.objects.first()
        if not cfg:
            cfg = ScheduleConfigModel.objects.create(opening_hours={}, breaks={}, holidays=[])
        return Response(ScheduleConfigSerializer(cfg).data)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        cfg = ScheduleConfigModel.objects.first()
        if not cfg:
            cfg = ScheduleConfigModel()
        ser = ScheduleConfigSerializer(cfg, data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)
