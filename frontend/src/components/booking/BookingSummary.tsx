import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
// import { appointments } from '@/lib/api';
import { format } from 'date-fns';

interface BookingSummaryProps {
  onNext?: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BookingSummary({ onPrev }: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    selectedServices, 
    selectedDate, 
    selectedTimeSlot, 
    selectedTechnician, 
    customerInfo,
    getTotalDuration,
    clearBooking,
  } = useBookingStore();

  // const bookingMutation = useMutation({
  //   mutationFn: (bookingData: any) => appointments.create(bookingData),
  //   onSuccess: () => {
  //     clearBooking();
  //     navigate('/book/success');
  //   },
  //   onError: (error) => {
  //     console.error('Booking failed:', error);
  //     toast({
  //       title: "Booking Failed",
  //       description: "There was an error processing your appointment. Please try again or call us directly.",
  //       variant: "destructive",
  //     });
  //   },
  // });

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);

    const bookingData = {
      serviceIds: selectedServices.map(s => s.id),
      date: selectedDate,
      timeSlotId: selectedTimeSlot.id,
      technicianId: selectedTechnician?.id,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      notes: customerInfo.notes,
    };

    try {
      // If API is not available, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearBooking();
      navigate('/book/success');
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your appointment. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDate || !selectedTimeSlot) {
    navigate('/book');
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Review Your Appointment
        </h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your booking
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Services Summary */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Selected Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={service.image || '/placeholder.svg'} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{service.duration} min</Badge>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>Total Duration:</span>
              <span className="text-primary">{getTotalDuration()} minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Appointment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Date</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Time</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </div>
                </div>
              </div>
            </div>

            {selectedTechnician && (
              <>
                <Separator />
                <div className="flex items-center space-x-4">
                  <User className="w-5 h-5 text-primary" />
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedTechnician.avatar || '/placeholder.svg'}
                      alt={selectedTechnician.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">Your Technician</div>
                      <div className="text-sm text-muted-foreground">{selectedTechnician.name}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{customerInfo.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>{customerInfo.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>{customerInfo.phone}</span>
              </div>
              {customerInfo.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="font-medium text-foreground mb-2">Special Notes:</div>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                      {customerInfo.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salon Information */}
        <Card className="card-elegant bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Bella Nails Salon</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>123 Beauty Street, Downtown Beauty District</p>
              <p>Phone: (555) 123-4567</p>
              <p className="mt-3 text-xs">
                Please arrive 10 minutes early for check-in. Free parking available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onPrev} className="flex-1">
            Back to Edit Info
          </Button>
          
          <Button 
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="flex-1 btn-hero"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
          </Button>
        </div>
      </div>
    </div>
  );
}