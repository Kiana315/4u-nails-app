from django.db import models
from datetime import datetime, timedelta

from apps.services.models import Service
from apps.technicians.models import Technician


class Appointment(models.Model):
    STATUS_CHOICES = (
        ("created", "Created"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No-show"),
    )

    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=30)

    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    technician = models.ForeignKey(
        Technician, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="appointments",
    )

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True)  # 后端自动计算

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-start_time"]
        indexes = [
            models.Index(fields=["date", "start_time", "end_time"]),
            models.Index(fields=["technician", "date"]),
        ]

    def save(self, *args, **kwargs):
        if self.service_id and self.date and self.start_time:
            start_dt = datetime.combine(self.date, self.start_time)
            end_dt = start_dt + timedelta(minutes=int(self.service.duration))
            self.end_time = end_dt.time()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer_name} - {self.service} on {self.date} at {self.start_time}"
