from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'service', 'technician', 'date', 'time', 'status')
    list_filter = ('status', 'date', 'service')
    search_fields = ('customer_name', 'phone_number')
