# 4U Nails

4U Nails is a full-stack salon booking application that gives customers a simple way to explore services, create an account, and book appointments online. Staff can manage services, technicians, schedules, and appointments from an administrative dashboard.

## Demo Video

https://github.com/user-attachments/assets/2e12edfa-4226-4082-9d18-54c17bbbcc09

## Features

### Customer experience

- Browse manicure, pedicure, nail design, and waxing services
- Register and sign in with secure password validation
- Select one or multiple services in a single booking
- Choose a date, technician, and available time slot
- Add contact details and special requests
- Review appointment details before confirming
- View the confirmed services, date, time, technician, customer details, and confirmation number

### Staff experience

- JWT-based authentication and role-based permissions
- Manage services and technicians
- View, create, update, and cancel appointments
- Configure technician availability and working days
- Access interactive API documentation

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form and Zod
- Tailwind CSS and shadcn/ui

### Backend

- Python 3.12+
- Django 5
- Django REST Framework
- Simple JWT
- SQLite for local development
- PostgreSQL-ready database configuration
- drf-spectacular / OpenAPI

## Project Structure

```text
4u-nails-app/
├── backend/
│   ├── apps/
│   │   ├── appointments/
│   │   ├── core/
│   │   ├── schedule/
│   │   ├── services/
│   │   ├── technicians/
│   │   └── users/
│   ├── backend/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Kiana315/4u-nails-app.git
cd 4u-nails-app
```

### 2. Start the backend

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies and prepare the database:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The website will be available at `http://127.0.0.1:5173/`.

## Environment Configuration

Create `frontend/.env`:

```env
VITE_API_BASE=http://127.0.0.1:8000/api
```

The backend supports environment variables such as:

```env
SECRET_KEY=replace-with-a-secure-secret
DB_URL=sqlite:///db.sqlite3
TIME_ZONE=America/Edmonton
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

Never commit production secrets to the repository.

## Demo Accounts

After running `python manage.py seed_demo`:

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `adminpass` |
| Technician | `tech` | `techpass` |
| Customer | `customer` | `customerpass` |

These accounts are for local development only.

## Main API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/register/` | Register a customer account |
| `POST` | `/api/token/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/token/refresh/` | Refresh an access token |
| `GET` | `/api/me/` | Get the authenticated user |

### Public booking

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/services/` | List active services |
| `GET` | `/api/technicians/` | List active technicians |
| `GET` | `/api/public/slots/` | Find available appointment times |
| `POST` | `/api/public/appointments/` | Create an appointment |

Example availability request:

```text
GET /api/public/slots/?date=2026-08-12&serviceId=1&technicianId=2
```

### API documentation

- OpenAPI schema: `http://127.0.0.1:8000/api/schema/`
- Swagger UI: `http://127.0.0.1:8000/api/docs/`

## Testing

Run the backend test suite:

```bash
cd backend
python manage.py test
```

Build the frontend:

```bash
cd frontend
npm run build
```

## License

This project is licensed under the [MIT License](LICENSE).
