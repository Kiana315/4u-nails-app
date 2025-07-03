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
