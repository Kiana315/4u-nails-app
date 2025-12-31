# Bella Nails - Nail Salon Booking Web App

A modern, elegant nail salon booking application built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### Visitor Experience
- **Beautiful Landing Page** with smooth scroll navigation
- **Service Showcase** with detailed descriptions and images
- **Online Booking Flow** for appointments
- **Responsive Design** optimized for all devices
- **Professional Design** with warm, elegant aesthetics

### Booking System
- Multi-step booking wizard (Services → Date/Time → Customer Info → Review)
- Service selection with detailed information
- Date and time slot availability checking
- Technician selection and preferences
- Customer information collection with validation
- Booking confirmation and success pages

### Admin Dashboard
- Dashboard overview with key metrics
- Today's appointments management
- Quick action shortcuts
- Extensible for Phase 2 features

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom Design System
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand (booking flow)
- **HTTP Client**: Axios with JWT interceptor
- **Data Fetching**: React Query/TanStack Query
- **Typography**: Noto Serif (headings) + Inter (body)

## 🚀 Getting Started

### Prerequisites
- Node.js (16+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory (optional, defaults provided):
   ```env
   VITE_API_BASE=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── common/          # Shared components (Navbar, Footer)
│   ├── home/           # Homepage sections
│   └── booking/        # Booking flow components
├── pages/              # Page components
│   ├── booking/        # Booking pages
│   └── admin/         # Admin pages
├── lib/                # Utilities and configurations
├── hooks/             # Custom React hooks
├── stores/            # Zustand stores
├── types/             # TypeScript type definitions
└── styles/            # CSS and styling
```

## 🎨 Design System

The application uses a sophisticated design system with:

- **Color Palette**: Warm rose gold and elegant neutrals
- **Typography**: Noto Serif for headings, Inter for body text
- **Components**: Customized shadcn/ui components
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

### Color Tokens
```css
Primary: Rose gold (#D4A574)
Secondary: Warm neutral (#F5F5F0)
Accent: Soft pink (#F0E6E6)
Background: Warm white (#FDFDFC)
```

## 🔌 Backend Integration

The app is designed to work with a Django/DRF backend. Key API endpoints:

### Authentication
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `GET /api/me/` - Current user info

### Services & Booking
- `GET /api/services/` - List services
- `GET /api/slots/` - Available time slots
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/` - List appointments

### Admin Endpoints
- `GET /api/admin/dashboard/overview/` - Dashboard stats
- `CRUD /api/admin/services/` - Service management
- `CRUD /api/admin/technicians/` - Staff management
- `GET /api/admin/appointments/` - Appointment management

### Mock Data Fallback
When the backend is unavailable, the app automatically falls back to mock data to ensure functionality during development and testing.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Pages & Routes

- `/` - Homepage with all sections
- `/book` - Booking flow wizard
- `/book/confirm` - Booking confirmation
- `/book/success` - Booking success
- `/admin` - Admin dashboard (Phase 2)

## ✨ Key Features Implementation

### Smooth Scroll Navigation
The navbar uses smooth scrolling to section anchors. If not on the homepage, it navigates there first then scrolls.

### Booking Flow State
Uses Zustand with persistence to maintain booking state across page reloads and navigation.

### Form Validation
All forms use React Hook Form with Zod schemas for robust validation and great UX.

### Responsive Design
Mobile-first approach with elegant animations and interactions on all screen sizes.

### API Error Handling
Graceful fallback to mock data when backend is unavailable, with proper error states.

## 🔮 Phase 2 Extensions (Planned)

- **Payments Integration** (Stripe/PayPal)
- **Customer Reviews & Ratings**
- **Email/SMS Notifications**
- **Loyalty Program & Discounts**
- **Gallery & Portfolio**
- **Staff Mobile App**
- **Advanced Analytics**
- **Inventory Management**
- **Marketing Campaigns**
- **Multi-location Support**

## 🔒 Security & Performance

- JWT-based authentication with automatic refresh
- Form validation on both client and server side
- Lazy loading of images and components
- Optimized bundle size with tree shaking
- Semantic HTML for accessibility
- WCAG 2.1 compliance considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Acceptance Criteria ✅

- ✅ Running `npm run dev` launches the app successfully
- ✅ Homepage includes all sections with smooth scroll navigation
- ✅ ServicesTable fetches from API with mock fallback
- ✅ Complete booking flow: Services → Date/Time → Customer Info → Confirmation
- ✅ Axios interceptor and React Query integration
- ✅ Responsive design with elegant aesthetics
- ✅ TypeScript throughout with proper type safety
- ✅ Admin dashboard with placeholder data
- ✅ Clean, extensible code with TODO comments for Phase 2

## 📞 Support

For questions or support:
- 📧 Email: hello@bellanails.com
- 📞 Phone: (555) 123-4567
- 🏢 Address: 123 Beauty Street, Downtown Beauty District

---

Built with ❤️ for beautiful nails and exceptional customer experiences.