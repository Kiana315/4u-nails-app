from django.db import models


class Appointment(models.Model):
    SERVICE_CHOICES = [
        ("French Manicure", "French Manicure"),
        ("Gel Polish", "Gel Polish"),
        ("Nail Art Design", "Nail Art Design"),
        ("Extension with Gel", "Extension with Gel"),
        ("Pedicure", "Pedicure"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    technician = models.CharField(max_length=100, blank=True)  # 可选
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.service} on {self.date} at {self.time}"
