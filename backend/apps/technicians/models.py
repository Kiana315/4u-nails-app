from django.db import models
from django.conf import settings

WEEKDAYS = [
    ("mon", "Mon"),
    ("tue", "Tue"),
    ("wed", "Wed"),
    ("thu", "Thu"),
    ("fri", "Fri"),
    ("sat", "Sat"),
    ("sun", "Sun"),
]

class Technician(models.Model):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)

    # ✅ 只存工作日：["mon","wed","fri"] 这种
    working_days = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name
