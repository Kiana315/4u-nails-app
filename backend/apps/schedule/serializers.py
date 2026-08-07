from rest_framework import serializers
from .models import ScheduleConfigModel

class ScheduleConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleConfigModel
        fields = ["id", "opening_hours", "breaks", "holidays", "updated_at"]
