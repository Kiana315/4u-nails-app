from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, time
from apps.schedule.models import ScheduleConfigModel
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.appointments.models import Appointment
from rest_framework.test import APIClient

class AppointmentCreationTests(TestCase):
    def setUp(self):
        ScheduleConfigModel.objects.create(
            opening_hours={"mon": [{"start": "09:00", "end": "17:00"}]},
            breaks={},
            holidays=[],
        )
        self.service = Service.objects.create(name="Test", duration_min=60, is_active=True)
        self.tech = Technician.objects.create(name="Tech A", active=True)
        self.tech.skills.add(self.service)
        self.user = get_user_model().objects.create_user(username="cust", password="pass", role="customer")
        self.client = APIClient()
        token = self.client.post("/api/token/", {"username": "cust", "password": "pass"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_create_with_tech(self):
        payload = {
            "service_id": self.service.id,
            "technician_id": self.tech.id,
            "date": "2024-12-02",
            "start_time": "09:00",
        }
        resp = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Appointment.objects.count(), 1)

    def test_create_without_tech(self):
        payload = {
            "service_id": self.service.id,
            "date": "2024-12-02",
            "start_time": "10:00",
        }
        resp = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(resp.status_code, 201)
