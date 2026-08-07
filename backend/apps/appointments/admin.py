from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "customer_phone",
        "services_display",
        "technician",
        "date",
        "start_time",
        "end_time",
        "status",
    )

    list_filter = ("status", "date", "technician")
    search_fields = ("customer_name", "customer_phone")
    
    def services_display(self, obj: Appointment):
        # 把多个 services 拼成字符串
        return ", ".join(s.name for s in obj.services.all())

    services_display.short_description = "Services"
