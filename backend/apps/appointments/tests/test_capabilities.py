from datetime import time
from django.contrib.auth import get_user_model
from apps.technicians.models import Technician
from apps.appointments.models import Appointment
from . import test_availability_rules


class CapabilityTests(test_availability_rules.AvailabilityRulesTests):
    def staff_login(self):
        user = get_user_model().objects.create_user(username='capability-staff', is_staff=True)
        self.client.force_authenticate(user)

    def test_every_service_requires_a_qualified_single_technician(self):
        self.tech.services.set([self.services[0]])
        other = Technician.objects.create(name='Design only', working_days=['mon'])
        other.services.set([self.services[1]])
        self.assertEqual(self.slots().data['slots'], [])
        self.assertEqual(self.book().status_code, 400)
        self.assertEqual(self.book(technician=None).status_code, 400)
        self.tech.services.add(self.services[1])
        self.assertIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book().status_code, 201)

    def test_empty_capabilities_means_not_bookable(self):
        self.tech.services.clear()
        self.assertEqual(self.slots().data['slots'], [])
        self.assertEqual(self.book().status_code, 400)
        self.assertEqual(self.book(technician=None).status_code, 400)

    def test_unassigned_stays_null_and_reserves_capacity_until_cancelled(self):
        response = self.book(technician=None)
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data['technician'])
        appointment = Appointment.objects.get()
        self.assertIsNone(appointment.technician)
        self.assertTrue(appointment.no_preference)
        self.assertNotIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book().status_code, 400)
        self.assertEqual(self.book(technician=None).status_code, 400)
        appointment.refresh_from_db()
        self.assertIsNone(appointment.technician)  # Slot queries must never assign.
        self.staff_login()
        cancelled = self.client.patch(f'/api/admin/appointments/{appointment.pk}/', {'status': 'cancelled'})
        self.assertEqual(cancelled.status_code, 200)
        self.client.force_authenticate(None)
        self.assertIn('09:00', self.slots().data['slots'])
        self.assertEqual(self.book(technician=None).status_code, 201)

    def test_flexible_reservation_does_not_take_specialists_capacity_prematurely(self):
        generalist = Technician.objects.create(name='Basic only', working_days=['mon'])
        generalist.services.set([self.services[0]])
        first = self.book(technician=None, service_ids=[self.services[0].pk])
        self.assertEqual(first.status_code, 201)
        self.assertEqual(self.book(service_ids=[self.services[1].pk]).status_code, 201)
        self.assertEqual(self.book(technician=None, service_ids=[self.services[1].pk]).status_code, 400)
        self.assertIsNone(Appointment.objects.get(pk=first.data['id']).technician)

    def test_overlapping_unassigned_reservation_cannot_switch_staff_midway(self):
        other = Technician.objects.create(name='B', working_days=['mon'])
        other.services.set(self.services)
        Appointment.objects.create(customer_name='Fixed', customer_phone='7805550100',
            technician=other, date=self.day, start_time=time(9), end_time=time(10))
        self.assertEqual(self.book(technician=None).status_code, 201)  # 09:00-10:30 must fit A.
        self.assertEqual(self.book('10:00', service_ids=[self.services[1].pk]).status_code, 400)
        self.assertEqual(self.book('10:00', technician=other.pk, service_ids=[self.services[1].pk]).status_code, 201)

    def test_staff_can_assign_only_qualified_and_available_technician(self):
        generalist = Technician.objects.create(name='Basic only', working_days=['mon'])
        generalist.services.set([self.services[0]])
        response = self.book(technician=None)
        self.assertEqual(response.status_code, 201)
        self.staff_login()
        url = f"/api/admin/appointments/{response.data['id']}/"
        invalid = self.client.patch(url, {'technician': generalist.pk})
        self.assertEqual(invalid.status_code, 400)
        valid = self.client.patch(url, {'technician': self.tech.pk})
        self.assertEqual(valid.status_code, 200, valid.data)
        self.assertEqual(valid.data['technician'], self.tech.pk)
        self.assertEqual(valid.data['technician_display'], self.tech.name)
        unassign = self.client.patch(url, {'technician': None}, format='json')
        self.assertEqual(unassign.status_code, 200)
        self.assertIsNone(unassign.data['technician'])
        self.assertEqual(unassign.data['technician_display'], 'Unassigned')

    def test_capabilities_api_is_staff_only_and_round_trips(self):
        url = f'/api/admin/technicians/{self.tech.pk}/'
        self.assertIn(self.client.patch(url, {'services': []}, format='json').status_code, [401, 403])
        self.staff_login()
        response = self.client.patch(url, {'services': [self.services[0].pk]}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['services'], [self.services[0].pk])
        self.client.force_authenticate(None)
        public = self.client.get(f'/api/technicians/{self.tech.pk}/')
        self.assertEqual(public.data['services'], [self.services[0].pk])
