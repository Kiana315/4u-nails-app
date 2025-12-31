from rest_framework import serializers
from datetime import datetime, timedelta

from .models import Appointment
from apps.services.models import Service


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "service",
            "technician",
            "date",
            "start_time",
            "notes",
        ]

    def validate(self, attrs):
        service: Service = attrs["service"]
        date = attrs["date"]
        start_time = attrs["start_time"]
        technician = attrs.get("technician")

        # 计算 end_time（用于冲突判断）
        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(minutes=int(service.duration))
        end_time = end_dt.time()

        # 如果选了 technician，就检查该技师当日是否有重叠预约（排除 cancelled/no_show 可选）
        if technician is not None:
            qs = Appointment.objects.filter(
                technician=technician,
                date=date,
            ).exclude(status__in=["cancelled", "no_show"])

            # overlap 条件：existing.start < new.end AND new.start < existing.end
            conflict = qs.filter(start_time__lt=end_time, end_time__gt=start_time).exists()
            if conflict:
                raise serializers.ValidationError("This technician is not available at the selected time.")

        # 把计算得到的 end_time 塞回去（create 时会用）
        attrs["_computed_end_time"] = end_time
        return attrs

    def create(self, validated_data):
        end_time = validated_data.pop("_computed_end_time")
        appt = Appointment(**validated_data)
        appt.end_time = end_time
        appt.save()
        return appt


class AppointmentAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
