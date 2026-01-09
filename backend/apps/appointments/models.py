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

    services = models.ManyToManyField("services.Service", related_name="appointments", blank=True)
    technician = models.ForeignKey(
        Technician, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="appointments",
    )
    no_preference = models.BooleanField(default=False)

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
        super().save(*args, **kwargs)

    def __str__(self):
        services_text = ", ".join(s.name for s in self.services.all())
        if not services_text:
            services_text = "No services"
        tech_name = self.technician.name if self.technician else "No technician"
        return f"{self.customer_name} - {services_text} ({tech_name}) on {self.date} at {self.start_time}"

