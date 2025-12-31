from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "customer_phone",
        "service",
        "technician",
        "date",
        "start_time",
        "end_time",
        "status",
    )

    list_filter = ("status", "date", "technician")
    search_fields = ("customer_name", "customer_phone")
