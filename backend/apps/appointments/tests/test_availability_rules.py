from datetime import date, time
from rest_framework.test import APITestCase
from apps.schedule.models import ScheduleConfigModel
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.appointments.models import Appointment
from apps.appointments.selectors import compute_available_slots


class AvailabilityRulesTests(APITestCase):
    def setUp(self):
        self.day = date(2030, 1, 7)  # Monday
        self.config = ScheduleConfigModel.objects.create(
            opening_hours={'mon': [{'start': '09:00', 'end': '17:00'}]},
            breaks={'mon': [{'start': '12:00', 'end': '13:00'}]})
        self.services = [Service.objects.create(name='Manicure', duration=60),
                         Service.objects.create(name='Design', duration=30)]
        self.tech = Technician.objects.create(name='A', working_days=['mon'])
        self.tech.services.set(self.services)

    def slots(self, **extra):
        return self.client.get('/api/public/slots/', {
            'date': self.day.isoformat(),
            'serviceIds': ','.join(str(s.pk) for s in self.services),
            **extra})

    def book(self, start='09:00', **extra):
        return self.client.post('/api/public/appointments/', {
            'customer_name': 'Test Guest', 'customer_phone': '7805550100',
            'service_ids': [s.pk for s in self.services],
            'date': self.day.isoformat(), 'start_time': start,
            'technician': self.tech.pk, **extra}, format='json')

    def test_total_duration_and_break_and_closing_boundaries(self):
        response = self.slots()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['durationMin'], 90)
        self.assertEqual(response.data['stepMin'], 15)
        for valid in ['09:00', '10:30', '13:00', '15:30']:
            self.assertIn(valid, response.data['slots'])
        for invalid in ['10:45', '11:00', '12:00', '15:45', '16:00']:
            self.assertNotIn(invalid, response.data['slots'])
            self.assertEqual(self.book(invalid).status_code, 400)
        self.assertEqual(self.book('15:30').status_code, 201)
        self.assertEqual(Appointment.objects.get().end_time, time(17))

    def test_missing_off_day_and_inactive_schedule(self):
        for days, active in [([], True), (['tue'], True), (['mon'], False)]:
            self.tech.working_days, self.tech.active = days, active
            self.tech.save()
            self.assertEqual(self.slots().data['slots'], [])
            self.assertEqual(self.slots(technicianId=self.tech.pk).data['slots'], [])
            self.assertEqual(self.book().status_code, 400)
            self.assertEqual(self.book(technician=None).status_code, 400)

    def test_holiday_blocks_query_and_submission(self):
        self.config.holidays = [self.day.isoformat()]
        self.config.save()
        self.assertEqual(self.slots().data['slots'], [])
        self.assertEqual(self.book().status_code, 400)

    def test_cancellation_releases_time_and_keeps_history(self):
        self.assertEqual(self.book().status_code, 201)
        appointment = Appointment.objects.get()
        self.assertNotIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book().status_code, 400)
        from django.contrib.auth import get_user_model
        staff = get_user_model().objects.create_user(username='staff', is_staff=True)
        self.client.force_authenticate(staff)
        response = self.client.patch(f'/api/admin/appointments/{appointment.pk}/', {'status': 'cancelled'})
        self.assertEqual(response.status_code, 200)
        self.client.force_authenticate(None)
        self.assertIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book().status_code, 201)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, 'cancelled')
        self.assertEqual(Appointment.objects.count(), 2)

    def test_no_preference_requires_one_continuously_free_technician(self):
        other = Technician.objects.create(name='B', working_days=['mon'])
        other.services.set(self.services)
        for tech, start, end in [(self.tech, time(10), time(12)), (other, time(9), time(10))]:
            Appointment.objects.create(customer_name='Existing', customer_phone='7805550100',
                technician=tech, date=self.day, start_time=start, end_time=end)
        self.assertNotIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book(technician=None).status_code, 400)
        self.assertEqual(self.book('13:00', technician=None).status_code, 201)
        self.assertTrue(Appointment.objects.get(start_time=time(13)).no_preference)
        self.assertIsNone(Appointment.objects.get(start_time=time(13)).technician)

    def test_invalid_services_and_legacy_single_service(self):
        self.assertEqual(self.slots(serviceIds='bad').status_code, 400)
        self.assertEqual(self.book(service_ids=[]).status_code, 400)
        self.services[0].is_active = False
        self.services[0].save()
        self.assertEqual(self.slots().status_code, 400)
        self.assertEqual(self.book().status_code, 400)
        response = self.client.get('/api/public/slots/', {'date': self.day.isoformat(), 'serviceId': self.services[1].pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['durationMin'], 30)

    def test_slots_round_up_after_irregular_opening_break_and_booking(self):
        self.config.opening_hours = {'mon': [{'start': '09:07', 'end': '17:00'}]}
        self.config.breaks = {'mon': [{'start': '12:00', 'end': '13:08'}]}
        self.config.save()
        Appointment.objects.create(customer_name='Existing', customer_phone='7805550100',
            technician=self.tech, date=self.day, start_time=time(9, 15), end_time=time(10, 7, 1))
        result = self.slots().data['slots']
        self.assertEqual(result[0], '10:15')
        self.assertIn('13:15', result)
        self.assertTrue(all(value[-2:] in ['00', '15', '30', '45'] for value in result))
        self.assertNotIn('15:45', result)  # 90 minutes must still fit before closing.
        self.assertEqual(self.book('10:15').status_code, 201)

    def test_submit_rejects_non_quarter_hour_and_preserves_duration(self):
        for start in ['09:07', '09:15:01', '09:15:00.000001']:
            with self.subTest(start=start):
                response = self.book(start)
                self.assertEqual(response.status_code, 400)
                self.assertIn('start_time', response.data)
        self.services[1].duration = 35
        self.services[1].save()
        self.assertEqual(self.book('09:15').status_code, 201)
        self.assertEqual(Appointment.objects.get().end_time, time(10, 50))
        self.assertIn('13:00', self.slots().data['slots'])
