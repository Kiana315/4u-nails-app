// Core types for the nail salon booking app

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: string;
  targetAudience: string;
  image?: string;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  technicianId?: string;
}

export interface Technician {
  id: string;
  name: string;
  specialties: string[];
  avatar?: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  serviceIds: string[];
  services: Service[];
  date: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  technician?: Technician;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'technician';
  phone?: string;
}

export interface BookingState {
  selectedServices: Service[];
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  selectedTechnician: Technician | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  revenue: number;
  completedServices: number;
}