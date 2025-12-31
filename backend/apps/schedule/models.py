from django.db import models

class ScheduleConfigModel(models.Model):
    opening_hours = models.JSONField(default=dict, blank=True)
    breaks = models.JSONField(default=dict, blank=True)
    holidays = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Schedule Configuration"
        verbose_name_plural = "Schedule Configuration"

    def __str__(self):
        return f"ScheduleConfig ({self.updated_at:%Y-%m-%d %H:%M})"
