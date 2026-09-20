from rest_framework import serializers
from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import F

from .models import Appointment
from apps.services.models import Service
from apps.technicians.models import Technician
from .selectors import is_slot_available  # ✅ 用你现有的 availability 逻辑


class AppointmentCreateSerializer(serializers.ModelSerializer):
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True, allow_empty=False
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

    def validate_start_time(self, value):
        if value.minute % 15 or value.second or value.microsecond:
            raise serializers.ValidationError('Choose a start time at :00, :15, :30 or :45.')
        return value

    def validate(self, attrs):
        service_ids = attrs["service_ids"]
        date = attrs["date"]
        start_time = attrs["start_time"]
        technician = attrs.get("technician")  # may be None

        services = Service.objects.filter(id__in=service_ids, is_active=True)
        if services.count() != len(service_ids):
            raise serializers.ValidationError("Some services are invalid.")
        
        if any(s.duration <= 0 for s in services):
            raise serializers.ValidationError('Services must have a positive duration.')
        total_duration = sum(s.duration for s in services)

        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(minutes=total_duration)
        if end_dt.date() != date:
            raise serializers.ValidationError("Services must finish on the same day.")
        end_time = end_dt.time()

        if not is_slot_available(date, start_time, end_time, services, technician):
            raise serializers.ValidationError("No qualified technician has capacity for these services at this time.")
        attrs['technician'] = technician
        attrs['_no_preference'] = technician is None

        attrs["_computed_end_time"] = end_time
        attrs["_services_qs"] = services
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        end_time = validated_data.pop("_computed_end_time")
        no_pref = validated_data.pop("_no_preference", False)
        services = validated_data.pop("_services_qs")
        validated_data.pop("service_ids", None)

        # Serialize booking writes on SQLite and lock staff rows on other databases.
        Technician.objects.filter(active=True).update(active=F('active'))
        if not is_slot_available(validated_data['date'], validated_data['start_time'], end_time,
                                 services, validated_data.get('technician')):
            raise serializers.ValidationError('This time is no longer available. Please choose another time.')

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
        read_only_fields = ['no_preference']

    def get_services_display(self, obj: Appointment):
        # 返回 [{id, name}, ...]
        return [{"id": s.id, "name": s.name} for s in obj.services.all()]

    def get_technician_display(self, obj: Appointment):
        return obj.technician.name if obj.technician else "Unassigned"

    def validate(self, attrs):
        instance = self.instance
        if instance is None:
            return attrs
        scheduling = {'services', 'technician', 'date', 'start_time', 'end_time'}
        changed = any(key in attrs and attrs[key] != getattr(instance, key)
                      for key in scheduling - {'services'})
        if 'services' in attrs:
            changed = changed or {s.pk for s in attrs['services']} != set(instance.services.values_list('pk', flat=True))
        restoring = instance.status == 'cancelled' and attrs.get('status', instance.status) != 'cancelled'
        if attrs.get('status', instance.status) != 'cancelled' and (changed or restoring):
            services = attrs.get('services', list(instance.services.all()))
            start = attrs.get('start_time', instance.start_time)
            day = attrs.get('date', instance.date)
            tech = attrs.get('technician', instance.technician)
            if not services or any(not s.is_active or s.duration <= 0 for s in services):
                raise serializers.ValidationError('Select valid, active services.')
            if start.minute % 15 or start.second or start.microsecond:
                raise serializers.ValidationError('Choose a start time at :00, :15, :30 or :45.')
            end = datetime.combine(day, start) + timedelta(minutes=sum(s.duration for s in services))
            if end.date() != day or not is_slot_available(day, start, end.time(), services, tech, instance.pk):
                raise serializers.ValidationError('The selected staff member or time cannot accommodate these services.')
            attrs['end_time'] = end.time()
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        Technician.objects.filter(active=True).update(active=F('active'))
        instance.refresh_from_db()
        self.validate(validated_data)
        services = validated_data.pop("services", None)

        if 'technician' in validated_data:
            validated_data['no_preference'] = validated_data['technician'] is None

        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        if services is not None:
            instance.services.set(services)

        return instance
