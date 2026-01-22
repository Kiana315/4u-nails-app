from rest_framework import serializers
from datetime import datetime, timedelta

from .models import Appointment
from apps.services.models import Service
from apps.technicians.models import Technician
from .selectors import is_slot_available  # ✅ 用你现有的 availability 逻辑


class AppointmentCreateSerializer(serializers.ModelSerializer):
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "service_ids",       # 前端直接传 service id
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
        service_ids = attrs["service_ids"]
        date = attrs["date"]
        start_time = attrs["start_time"]
        technician = attrs.get("technician")  # may be None

        services = Service.objects.filter(id__in=service_ids)
        if services.count() != len(service_ids):
            raise serializers.ValidationError("Some services are invalid.")
        
        # ✅ duration 兼容：duration / duration_min
        total_duration = 0
        for s in services:
            d = getattr(s, "duration_min", None) or getattr(s, "duration", None) or 0
            total_duration += int(d)
        

        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(minutes=total_duration)
        end_time = end_dt.time()

        # 技师可用性判断：用总时长判断一整个时间段是否可用
        if technician is not None:
            if not is_slot_available(date, start_time, end_time, None, technician):
                raise serializers.ValidationError("This technician is not available at the selected time.")
            attrs["_no_preference"] = False

        if technician is None:
            chosen = None
            for tech in Technician.objects.filter(active=True):
                if is_slot_available(date, start_time, end_time, None, tech):
                    chosen = tech
                    break
            if chosen is None:
                raise serializers.ValidationError("No technician is available at the selected time.")
            attrs["technician"] = chosen
            attrs["_no_preference"] = True

        attrs["_computed_end_time"] = end_time
        attrs["_services_qs"] = services
        return attrs

    def create(self, validated_data):
        end_time = validated_data.pop("_computed_end_time")
        no_pref = validated_data.pop("_no_preference", False)
        services = validated_data.pop("_services_qs")
        validated_data.pop("service_ids", None)

        appt = Appointment(**validated_data)
        appt.end_time = end_time
        appt.no_preference = no_pref
        appt.save()
        appt.services.set(services)
        return appt


class AppointmentAdminSerializer(serializers.ModelSerializer):
    # ✅ 返回服务ID列表（你要的“存id/传id”）
    services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Service.objects.all(),
        required=False
    )


    # ✅ 额外返回服务名字给前端显示（推荐）
    services_display = serializers.SerializerMethodField()

    technician_display = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = "__all__"  # 会包含 services / technician_display / services_display

    def get_services_display(self, obj: Appointment):
        # 返回 [{id, name}, ...]
        return [{"id": s.id, "name": s.name} for s in obj.services.all()]

    def get_technician_display(self, obj: Appointment):
        if getattr(obj, "no_preference", False):
            return "No preference"
        return obj.technician.name if obj.technician else "—"

    def update(self, instance, validated_data):
        services = validated_data.pop("services", None)

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        if services is not None:
            instance.services.set(services)

        return instance
