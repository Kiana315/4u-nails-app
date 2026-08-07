# Nail Bar Web App

A modern, elegant web application for managing a nail salon — including online appointment booking, service listing, and technician scheduling.

Built with React + Vite (Frontend) and Django + DRF (Backend).

## Demo Video

[Watch the 4U Nails demo](demo/4U-Nails-English-Demo.webm)

Quickstart

- python -m venv .venv && source .venv/bin/activate
- pip install -r requirements.txt
- cp .env.example .env
- python manage.py migrate
- python manage.py seed_demo
- python manage.py runserver

Demo users

- admin / adminpass
- tech / techpass
- customer / customerpass
Auth (JWT)

- POST /api/token/ {"username":"customer","password":"customerpass"}
- POST /api/token/refresh/
- GET /api/me/ (Bearer <access>)

Public

- GET /api/services/
- GET /api/services/{id}/
- GET /api/slots/?date=YYYY-MM-DD&serviceId=1&technicianId=2

Example slots response

{
  "date": "2025-08-23",
  "serviceId": 1,
  "technicianId": null,
  "granularity_min": 15,
  "slots": ["09:00", "09:15", "09:30"]
}

Customer endpoints

- GET /api/appointments/?my=true
- POST /api/appointments/
  - Body: {"service_id":1, "technician_id":2, "date":"2025-08-25", "start_time":"10:00", "notes":"Soft pink"}
- PATCH /api/appointments/{id}/
- DELETE /api/appointments/{id}/

Admin/Tech

- GET /api/admin/dashboard/overview
- GET /api/admin/appointments/?date=&status=&technicianId=
- CRUD /api/admin/services/
- CRUD /api/admin/technicians/
- POST/PUT /api/admin/schedule/

OpenAPI

- /api/schema/ (JSON)
- /api/docs/ (Swagger UI)

Project Tree

backend/
  manage.py
  requirements.txt
  .env.example
  backend/
    settings.py, urls.py, asgi.py, wsgi.py
  apps/
    core/, users/, services/, technicians/, schedule/, appointments/

Frontend notes

- In React, set VITE_API_BASE=http://localhost:8000/api
- Ensure CORS_ALLOWED_ORIGINS includes your React origin.

Tests

- Run: python manage.py test
- Covers slot computation, appointment create, permissions.

# License
MIT License
© 2025 4U Nails
