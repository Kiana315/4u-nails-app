from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, time
from apps.schedule.models import ScheduleConfigModel
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.appointments.models import Appointment
from rest_framework.test import APIClient

class PermissionTests(TestCase):
    def setUp(self):
        ScheduleConfigModel.objects.create(opening_hours={"mon":[{"start":"09:00","end":"17:00"}]}, breaks={}, holidays=[])
        self.service = Service.objects.create(name="Test", duration_min=60, is_active=True)
        self.tech_profile = Technician.objects.create(name="Tech A", active=True)
        self.tech_profile.skills.add(self.service)
        User = get_user_model()
        self.admin = User.objects.create_user(username="adminu", password="pass", role="admin", is_staff=True, is_superuser=True)
        self.tech = User.objects.create_user(username="techu", password="pass", role="tech")
        self.cust = User.objects.create_user(username="custu", password="pass", role="customer")
        self.appt = Appointment.objects.create(service=self.service, technician=self.tech_profile, customer=self.cust, date=date(2024,12,2), start_time=time(9,0), end_time=time(10,0))

    def test_customer_cannot_access_admin(self):
        c = APIClient()
        token = c.post("/api/token/", {"username":"custu","password":"pass"}).data["access"]
        c.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(c.get("/api/admin/dashboard/overview").status_code, 403)

    def test_admin_can_access_admin(self):
        c = APIClient()
        token = c.post("/api/token/", {"username":"adminu","password":"pass"}).data["access"]
        c.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(c.get("/api/admin/dashboard/overview").status_code, 200)
