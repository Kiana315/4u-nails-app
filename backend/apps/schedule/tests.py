from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Appointment, CustomUser, Service, TimeSlot


class GuestBookingTests(APITestCase):
    def setUp(self):
        self.service = Service.objects.create(name="Manicure")
        self.technician = CustomUser.objects.create_user(
            username="nail-tech", phone="7805550100", role="technician")
        self.payload = {
            "customer_name": "Guest Customer", "phone_number": "+1 (780) 555-1234",
            "service": self.service.pk, "technician": None,
            "date": str(timezone.localdate() + timedelta(days=2)), "time": "10:00",
        }

    def test_guest_can_book_without_creating_account(self):
        response = self.client.post('/api/appointments/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        appointment = Appointment.objects.get()
        self.assertIsNone(appointment.customer)
        self.assertIsNone(appointment.technician)
        self.assertEqual(appointment.customer_name, self.payload['customer_name'])
        self.assertEqual(appointment.phone_number, self.payload['phone_number'])
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(str(appointment), f"Guest Customer - {appointment.slot}")

    def test_technician_can_be_selected_or_omitted(self):
        self.payload['technician'] = self.technician.pk
        response = self.client.post('/api/appointments/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Appointment.objects.get().technician, self.technician)
        self.payload.pop('technician')
        self.payload['time'] = '10:15'
        self.assertEqual(self.client.post('/api/appointments/', self.payload, format='json').status_code, 201)

    def test_public_catalog_excludes_contact_information(self):
        self.assertEqual(self.client.get('/api/services/').status_code, 200)
        self.assertEqual(self.client.get('/api/technicians/').data,
                         [{'id': self.technician.pk, 'username': self.technician.username}])
        self.assertIn(self.client.post('/api/services/', {'name': 'Unauthorized'}).status_code, [401, 403])
        self.assertEqual(Service.objects.count(), 1)

    def test_appointments_cannot_be_read_or_modified_publicly(self):
        created = self.client.post('/api/appointments/', self.payload, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertEqual(self.client.get('/api/appointments/').status_code, 405)
        url = f"/api/appointments/{created.data['id']}/"
        for method in ['get', 'patch', 'delete']:
            self.assertIn(getattr(self.client, method)(url).status_code, [404, 405])
        self.assertEqual(Appointment.objects.count(), 1)

    def test_invalid_inputs_do_not_create_appointments(self):
        invalid = [
            {'customer_name': ' '}, {'phone_number': 'invalid'},
            {'phone_number': '-------'}, {'service': 99999},
            {'date': str(timezone.localdate() - timedelta(days=1))},
            {'time': '09:00'}, {'time': '10:07'}, {'time': '10:00:01'},
        ]
        for changes in invalid:
            with self.subTest(changes=changes):
                response = self.client.post('/api/appointments/', self.payload | changes, format='json')
                self.assertEqual(response.status_code, 400, response.data)
        self.assertFalse(Appointment.objects.exists())
        self.assertFalse(TimeSlot.objects.exists())

    def test_inactive_or_non_technician_cannot_be_selected(self):
        for changes in [{'is_active': False}, {'is_active': True, 'role': 'customer'}]:
            for key, value in changes.items():
                setattr(self.technician, key, value)
            self.technician.save()
            response = self.client.post('/api/appointments/', self.payload | {'technician': self.technician.pk}, format='json')
            self.assertEqual(response.status_code, 400)

    def test_full_slot_returns_validation_error_and_existing_booking_can_be_edited(self):
        self.assertEqual(self.client.post('/api/appointments/', self.payload, format='json').status_code, 201)
        response = self.client.post('/api/appointments/', self.payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('time', response.data)
        self.assertEqual(Appointment.objects.count(), 1)
        appointment = Appointment.objects.get()
        appointment.notes = 'Updated by staff'
        appointment.save()
        appointment.refresh_from_db()
        self.assertEqual(appointment.notes, 'Updated by staff')

    def test_staff_can_still_manage_services(self):
        self.technician.is_staff = True
        self.technician.save()
        self.client.force_authenticate(self.technician)
        response = self.client.post('/api/services/', {'name': 'Pedicure'})
        self.assertEqual(response.status_code, 201)
