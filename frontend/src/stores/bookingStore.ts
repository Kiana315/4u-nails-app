import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingState, Service, TimeSlot, Technician } from '@/types';

interface BookingStore extends BookingState {
  // Actions
  setSelectedServices: (services: Service[]) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void;
  setSelectedTechnician: (technician: Technician | null) => void;
  setCustomerInfo: (info: Partial<BookingState['customerInfo']>) => void;
  clearBooking: () => void;
  
  // Computed
  getTotalDuration: () => number;
  isBookingComplete: () => boolean;
}

const initialState: BookingState = {
  selectedServices: [],
  selectedDate: null,
  selectedTimeSlot: null,
  selectedTechnician: null,
  customerInfo: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedServices: (services) => set({ selectedServices: services }),
      
      addService: (service) => set((state) => ({
        selectedServices: [...state.selectedServices, service],
      })),
      
      removeService: (serviceId) => set((state) => ({
        selectedServices: state.selectedServices.filter(s => s.id !== serviceId),
      })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
      
      setSelectedTechnician: (technician) => set({ selectedTechnician: technician }),
      
      setCustomerInfo: (info) => set((state) => ({
        customerInfo: { ...state.customerInfo, ...info },
      })),
      
      clearBooking: () => set(initialState),
      
      getTotalDuration: () => {
        const { selectedServices } = get();
        return selectedServices.reduce((total, service) => total + service.duration, 0);
      },
      
      isBookingComplete: () => {
        const { selectedServices, selectedDate, selectedTimeSlot, customerInfo } = get();
        return (
          selectedServices.length > 0 &&
          selectedDate !== null &&
          selectedTimeSlot !== null &&
          customerInfo.name !== '' &&
          customerInfo.email !== '' &&
          customerInfo.phone !== ''
        );
      },

      
    }),
    {
      name: 'booking-store',
    }
  )
);