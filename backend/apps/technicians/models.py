from django.db import models
from django.conf import settings
from apps.services.models import Service

class Technician(models.Model):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
