# services/models.py
from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=200)

    # 前端的 "description"
    description = models.TextField(blank=True)

    # 前端的 "duration"
    duration = models.PositiveIntegerField(default=60, help_text="Duration in minutes")

    # 前端的 "category"
    category = models.CharField(max_length=100, blank=True)

    # 前端的 "targetAudience"
    target_audience = models.CharField(max_length=100, blank=True, default="Everyone")

    # 前端的 "image"
    image = models.URLField(blank=True, help_text="Image URL")

    # 前端的 "isActive"
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
