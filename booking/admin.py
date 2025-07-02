from django.contrib import admin
from .models import CustomUser, Service, TechnicianSchedule, TimeSlot, Appointment
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


# -----------------------------
# CustomUser Admin（包括客户与技师）
# -----------------------------
@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {'fields': ('role', 'phone')}),
    )
    list_display = ('username', 'role', 'phone', 'email', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'phone', 'email')
    ordering = ('username',)


# -----------------------------
# Service Admin
# -----------------------------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'description')
    search_fields = ('name',)
    ordering = ('name',)


# -----------------------------
# TechnicianSchedule Admin
# -----------------------------
@admin.register(TechnicianSchedule)
class TechnicianScheduleAdmin(admin.ModelAdmin):
    list_display = ('technician', 'date', 'start_time', 'end_time')
    list_filter = ('date', 'technician')
    search_fields = ('technician__username',)


# -----------------------------
# TimeSlot Admin
# -----------------------------
@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'max_appointments')
    list_filter = ('date',)
    ordering = ('date', 'time')


# -----------------------------
# Appointment Admin
# -----------------------------
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('customer', 'service', 'technician', 'slot', 'created_at')
    list_filter = ('slot__date', 'technician')
    search_fields = ('customer__username', 'technician__username')
    ordering = ('-created_at',)
