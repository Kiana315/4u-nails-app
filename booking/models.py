from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

# -----------------------------
# 用户模型，统一账号管理 + 角色
# -----------------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('technician', 'Technician'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, unique=True)  # 必填且唯一
    email = models.EmailField(blank=True, null=True)      # 可选

    def __str__(self):
        return self.username

    def is_technician(self):
        return self.role == 'technician'

    def is_customer(self):
        return self.role == 'customer'

    def is_admin(self):
        return self.role == 'admin'


# -----------------------------
# 美甲服务项
# -----------------------------
class Service(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name



# -----------------------------
# 技师每日排班
# -----------------------------
class TechnicianSchedule(models.Model):
    technician = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'technician'})
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('technician', 'date')

    def __str__(self):
        return f"{self.technician.username} on {self.date}"



# -----------------------------
# 时间段（每15分钟一个slot）
# -----------------------------
class TimeSlot(models.Model):
    date = models.DateField()
    time = models.TimeField()
    max_appointments = models.IntegerField(default=1)

    class Meta:
        unique_together = ('date', 'time')

    def __str__(self):
        return f"{self.date} {self.time}"


# -----------------------------
# 预约记录
# -----------------------------
class Appointment(models.Model):
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    technician = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assigned_appointments', limit_choices_to={'role': 'technician'})
    slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.username} - {self.slot}"

    def save(self, *args, **kwargs):
        existing = Appointment.objects.filter(slot=self.slot).count()
        if existing >= self.slot.max_appointments:
            raise ValueError("This time slot is already full.")
        super().save(*args, **kwargs)


