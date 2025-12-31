from django.contrib import admin
from .models import Technician

@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = ("name", "active")
    list_filter = ("active",)
    search_fields = ("name",)
