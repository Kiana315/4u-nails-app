import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { Navbar } from '@/components/common/Navbar';

export default function BookingConfirm() {
  const navigate = useNavigate();
  const { 
    selectedServices, 
    selectedDate, 
    selectedTimeSlot, 
    selectedTechnician, 
    customerInfo,
    getTotalDuration,
    clearBooking 
  } = useBookingStore();

  const handleConfirm = async () => {
    try {
      // TODO: Submit booking to API
      // await appointments.create({ ... });
      
      // Clear booking data and redirect to success
      clearBooking();
      navigate('/book/success');
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error - show toast, etc.
    }
  };

  const handleEdit = () => {
    navigate('/book');
  };

  if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) {
    navigate('/book');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
                Confirm Your Appointment
              </h1>
              <p className="text-muted-foreground">
                Please review your booking details before confirming
              </p>
            </div>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Appointment Details</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Services */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Selected Services</h3>
                  <div className="space-y-2">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.duration} minutes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total duration: {getTotalDuration()} minutes
                  </div>
                </div>

                <Separator />

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technician */}
                {selectedTechnician && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Technician</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTechnician.name}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-primary" />
                      <span>{customerInfo.name}</span>
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
                      <div className="mt-3">
                        <div className="font-medium mb-1">Special Notes</div>
                        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                          {customerInfo.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Salon Info */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">Bella Nails Salon</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    123 Beauty Street, Downtown Beauty District<br />
                    Phone: (555) 123-4567
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    Edit Booking
                  </Button>
                  <Button 
                    onClick={handleConfirm}
                    className="flex-1 btn-hero"
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}