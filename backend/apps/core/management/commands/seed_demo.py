from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.schedule.models import ScheduleConfigModel

class Command(BaseCommand):
    help = "Seed demo data: services, technicians, schedule, users"

    def handle(self, *args, **options):
        User = get_user_model()
        # Users
        admin, _ = User.objects.get_or_create(username="admin", defaults={"email": "admin@example.com", "role": "admin", "is_staff": True, "is_superuser": True})
        admin.set_password("adminpass")
        admin.save()
        tech_user, _ = User.objects.get_or_create(username="tech", defaults={"email": "tech@example.com", "role": "tech", "is_staff": True})
        tech_user.set_password("techpass")
        tech_user.save()
        cust, _ = User.objects.get_or_create(username="customer", defaults={"email": "customer@example.com", "role": "customer"})
        cust.set_password("customerpass")
        cust.save()

        # Services
        s1, _ = Service.objects.get_or_create(name="Classic Manicure", defaults={"duration_min": 30, "category": "Manicure", "highlight": "Nail trim + polish"})
        s2, _ = Service.objects.get_or_create(name="Gel Manicure", defaults={"duration_min": 45, "category": "Manicure"})
        s3, _ = Service.objects.get_or_create(name="Spa Pedicure", defaults={"duration_min": 60, "category": "Pedicure"})

        # Technicians
        t1, _ = Technician.objects.get_or_create(name="Alice")
        t1.user = tech_user
        t1.save()
        t1.skills.set([s1, s2, s3])
        t2, _ = Technician.objects.get_or_create(name="Bella")
        t2.skills.set([s1, s3])

        # Schedule
        cfg = ScheduleConfigModel.objects.first()
        if not cfg:
            cfg = ScheduleConfigModel.objects.create(
                opening_hours={
                    "mon": [{"start": "09:00", "end": "18:00"}],
                    "tue": [{"start": "09:00", "end": "18:00"}],
                    "wed": [{"start": "09:00", "end": "18:00"}],
                    "thu": [{"start": "09:00", "end": "18:00"}],
                    "fri": [{"start": "09:00", "end": "18:00"}],
                    "sat": [{"start": "10:00", "end": "16:00"}],
                    "sun": [],
                },
                breaks={
                    "mon": [{"start": "13:00", "end": "14:00"}],
                    "tue": [{"start": "13:00", "end": "14:00"}],
                    "wed": [{"start": "13:00", "end": "14:00"}],
                    "thu": [{"start": "13:00", "end": "14:00"}],
                    "fri": [{"start": "13:00", "end": "14:00"}],
                    "sat": [],
                    "sun": [],
                },
                holidays=[],
            )
        self.stdout.write(self.style.SUCCESS("Demo data seeded. Users: admin/adminpass, tech/techpass, customer/customerpass"))
