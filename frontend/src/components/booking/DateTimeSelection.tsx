import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { slots } from '@/lib/api';
import { useBookingStore } from '@/stores/bookingStore';
import type { TimeSlot, Technician } from '@/types';
import { format } from 'date-fns';

// Mock data
const mockTimeSlots: TimeSlot[] = [
  { id: '1', startTime: '9:00 AM', endTime: '10:00 AM', isAvailable: true, technicianId: 'tech1' },
  { id: '2', startTime: '10:00 AM', endTime: '11:00 AM', isAvailable: true, technicianId: 'tech1' },
  { id: '3', startTime: '11:00 AM', endTime: '12:00 PM', isAvailable: false, technicianId: 'tech1' },
  { id: '4', startTime: '12:00 PM', endTime: '1:00 PM', isAvailable: true, technicianId: 'tech2' },
  { id: '5', startTime: '1:00 PM', endTime: '2:00 PM', isAvailable: true, technicianId: 'tech2' },
  { id: '6', startTime: '2:00 PM', endTime: '3:00 PM', isAvailable: true, technicianId: 'tech1' },
  { id: '7', startTime: '3:00 PM', endTime: '4:00 PM', isAvailable: true, technicianId: 'tech3' },
  { id: '8', startTime: '4:00 PM', endTime: '5:00 PM', isAvailable: false, technicianId: 'tech2' },
];

const mockTechnicians: Technician[] = [
  {
    id: 'tech1',
    name: 'Maria Rodriguez',
    specialties: ['Manicure', 'Nail Art'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68ca2c2?w=150&h=150&fit=crop&crop=face',
    isAvailable: true,
  },
  {
    id: 'tech2',
    name: 'Sofia Chen',
    specialties: ['Pedicure', 'Gel Manicure'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isAvailable: true,
  },
  {
    id: 'tech3',
    name: 'Ana Williams',
    specialties: ['Extensions', 'French Manicure'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    isAvailable: true,
  },
];

interface DateTimeSelectionProps {
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function DateTimeSelection({ onNext, onPrev }: DateTimeSelectionProps) {
  const { 
    selectedDate, 
    selectedTimeSlot, 
    selectedTechnician,
    selectedServices,
    setSelectedDate, 
    setSelectedTimeSlot,
    setSelectedTechnician,
  } = useBookingStore();

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  const { data: slotsData } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => slots.getAvailable({
      date: selectedDate || '',
      serviceId: selectedServices[0]?.id,
    }),
    enabled: !!selectedDate,
    retry: false,
  });

  const availableSlots = slotsData?.data || mockTimeSlots;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarDate(date);
      setSelectedDate(format(date, 'yyyy-MM-dd'));
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    
    // Auto-select technician if slot has one assigned
    if (slot.technicianId) {
      const technician = mockTechnicians.find(t => t.id === slot.technicianId);
      if (technician) {
        setSelectedTechnician(technician);
      }
    }
  };

  const getTechnicianById = (technicianId: string | undefined) => {
    return mockTechnicians.find(t => t.id === technicianId);
  };

  // Filter out past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Select Date & Time
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and available time slot
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Choose a Date</h3>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Available Times</h3>
            
            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots
                  .filter(slot => slot.isAvailable)
                  .map((slot) => {
                    const technician = getTechnicianById(slot.technicianId);
                    const isSelected = selectedTimeSlot?.id === slot.id;
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        <div className="font-medium">
                          {slot.startTime}
                        </div>
                        {technician && (
                          <div className="text-xs opacity-75">
                            {technician.name}
                          </div>
                        )}
                      </Button>
                    );
                  })
                }
              </div>
            )}

            {selectedDate && availableSlots.filter(slot => slot.isAvailable).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available slots for this date</p>
                <p className="text-sm">Please try another date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Technician */}
      {selectedTechnician && (
        <Card className="card-elegant bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Your Technician
            </h3>
            
            <div className="flex items-center space-x-4">
              <img
                src={selectedTechnician.avatar || '/placeholder.svg'}
                alt={selectedTechnician.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-foreground">{selectedTechnician.name}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTechnician.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTimeSlot && (
        <Card className="card-elegant bg-accent/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Your Appointment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </span>
              </div>
              {selectedTechnician && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technician:</span>
                  <span className="font-medium">{selectedTechnician.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back to Services
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!selectedDate || !selectedTimeSlot}
          className="btn-hero"
        >
          Continue to Your Info
        </Button>
      </div>
    </div>
  );
}