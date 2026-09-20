from rest_framework import serializers
from .models import CustomUser, Service, TimeSlot, Appointment

# 用户（客户/技师）序列化器
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'phone', 'email', 'role']

# 服务序列化器
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name']

# 时间段序列化器
class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'date', 'time', 'max_appointments']

# 预约序列化器
class AppointmentSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    technician = UserSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    slot = TimeSlotSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'customer', 'service', 'technician', 'slot', 'notes', 'created_at']


class PublicTechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']


class GuestAppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(max_length=100)
    phone_number = serializers.RegexField(r'^\+?[0-9() .-]{7,20}$', max_length=20)
    technician = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='technician', is_active=True),
        required=False, allow_null=True,
    )
    date = serializers.DateField(write_only=True)
    time = serializers.TimeField(write_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'customer_name', 'phone_number', 'service', 'technician', 'date', 'time', 'notes']
        read_only_fields = ['id']

    def validate_phone_number(self, value):
        if not 7 <= sum(char.isdigit() for char in value) <= 15:
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate(self, attrs):
        from datetime import datetime, time
        from django.utils import timezone
        when = timezone.make_aware(datetime.combine(attrs['date'], attrs['time']))
        if when <= timezone.now():
            raise serializers.ValidationError({'date': 'Choose a future date and time.'})
        selected = attrs['time']
        if not time(10) <= selected <= time(19) or selected.minute % 15 or selected.second or selected.microsecond:
            raise serializers.ValidationError({'time': 'Choose a 15-minute slot between 10:00 and 19:00.'})
        return attrs

    def create(self, validated_data):
        from django.db import transaction
        from django.db.models import F
        date = validated_data.pop('date')
        time = validated_data.pop('time')
        with transaction.atomic():
            # Acquire a write lock before counting, including on SQLite.
            TimeSlot.objects.filter(date=date, time=time).update(max_appointments=F('max_appointments'))
            slot, _ = TimeSlot.objects.get_or_create(date=date, time=time)
            if Appointment.objects.filter(slot=slot).count() >= slot.max_appointments:
                raise serializers.ValidationError({'time': 'This time slot is full. Choose another time.'})
            return Appointment.objects.create(slot=slot, **validated_data)
