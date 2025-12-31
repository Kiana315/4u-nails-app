from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import ScheduleConfigModel

@admin.register(ScheduleConfigModel)
class ScheduleConfigAdmin(admin.ModelAdmin):
    list_display = ("id", "updated_at")
