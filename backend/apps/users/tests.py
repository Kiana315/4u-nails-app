from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    def setUp(self):
        self.url = "/api/register/"
        self.payload = {
            "username": "newcustomer",
            "email": "customer@example.com",
            "first_name": "New",
            "last_name": "Customer",
            "password": "SecurePass482!",
            "password_confirm": "SecurePass482!",
        }

    def test_customer_can_register_and_receive_tokens(self):
        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        user = get_user_model().objects.get(username="newcustomer")
        self.assertEqual(user.role, "customer")
        self.assertTrue(user.check_password(self.payload["password"]))

    def test_duplicate_email_is_rejected_case_insensitively(self):
        get_user_model().objects.create_user(
            username="existing",
            email="customer@example.com",
            password="SecurePass482!",
        )
        self.payload["email"] = "CUSTOMER@example.com"

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_password_confirmation_must_match(self):
        self.payload["password_confirm"] = "DifferentPass482!"

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)
