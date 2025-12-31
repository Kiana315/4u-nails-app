import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Phone, Mail, MapPin } from 'lucide-react';

export default function BookingSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            
            <h1 className="font-serif text-4xl font-semibold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for choosing Bella Nails! Your appointment has been successfully booked. 
              We've sent a confirmation email with all the details.
            </p>
          </div>

          <Card className="card-elegant mb-8">
            <CardContent className="p-8">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                What's Next?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Check Your Email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent you a confirmation with all the appointment details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Call if Needed</h3>
                    <p className="text-sm text-muted-foreground">
                      Questions? Call us at (555) 123-4567. We're happy to help.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Prepare for Visit</h3>
                    <p className="text-sm text-muted-foreground">
                      Please arrive 10 minutes early for check-in and preparation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Find Us Easily</h3>
                    <p className="text-sm text-muted-foreground">
                      123 Beauty Street, Downtown Beauty District. Free parking available.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/book">
                <Button size="lg" className="btn-hero">
                  Book Another Appointment
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Need to reschedule or cancel? Call us at (555) 123-4567 at least 24 hours in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}