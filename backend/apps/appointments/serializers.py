from rest_framework import serializers
from datetime import datetime, timedelta

from .models import Appointment
from apps.services.models import Service


from apps.technicians.models import Technician
from .selectors import is_slot_available  # ✅ 用你现有的 availability 逻辑

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "service",       # 前端直接传 service id
            "technician",    # 可选：允许 null（No preference）
            "date",
            "start_time",
            "notes",
        ]
        extra_kwargs = {
            "technician": {"required": False, "allow_null": True},
            "notes": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        service: Service = attrs["service"]
        date = attrs["date"]
        start_time = attrs["start_time"]
        technician = attrs.get("technician")  # may be None

        # ✅ duration 兼容：duration / duration_min
        duration_raw = getattr(service, "duration_min", None) or getattr(service, "duration", None) or 30
        duration_min = int(duration_raw)

        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(minutes=duration_min)
        end_time = end_dt.time()

        # 1) 如果指定 technician：必须可用（营业时间+break+冲突）
        if technician is not None:
            ok = is_slot_available(date, start_time, end_time, service, technician)
            if not ok:
                raise serializers.ValidationError("This technician is not available at the selected time.")

        # 2) 如果不指定 technician（No preference）：自动选一个可用的 active 技师
        if technician is None:
            chosen = None
            for tech in Technician.objects.filter(active=True):
                if is_slot_available(date, start_time, end_time, service, tech):
                    chosen = tech
                    break
            if chosen is None:
                raise serializers.ValidationError("No technician is available at the selected time.")
            attrs["technician"] = chosen  # ✅ 自动分配
            technician = chosen

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
