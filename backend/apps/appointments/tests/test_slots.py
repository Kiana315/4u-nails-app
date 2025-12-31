from django.test import TestCase
from django.utils import timezone
from datetime import date, time
from apps.schedule.models import ScheduleConfigModel
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.appointments.selectors import compute_available_slots, is_slot_available
from apps.appointments.models import Appointment

class SlotLogicTests(TestCase):
    def setUp(self):
        ScheduleConfigModel.objects.create(
            opening_hours={"mon": [{"start": "09:00", "end": "17:00"}]},
            breaks={"mon": [{"start": "12:00", "end": "13:00"}]},
            holidays=[],
        )
        self.service = Service.objects.create(name="Test", duration_min=60, is_active=True)
        self.tech = Technician.objects.create(name="Tech A", active=True)
        self.tech.skills.add(self.service)

    def test_slots_respect_breaks(self):
        d = date(2024, 12, 2)  # Monday
        slots = compute_available_slots(d, self.service, self.tech)
        self.assertIn(time(9,0), slots)
        self.assertNotIn(time(12,0), slots)  # during break

    def test_conflict(self):
        d = date(2024, 12, 2)
        Appointment.objects.create(service=self.service, technician=self.tech, date=d, start_time=time(9,0), end_time=time(10,0))
        ok = is_slot_available(d, time(9,0), time(10,0), self.service, self.tech)
        self.assertFalse(ok)
