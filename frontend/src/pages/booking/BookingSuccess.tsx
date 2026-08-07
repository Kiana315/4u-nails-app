import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, MapPin, Phone, Sparkles, User } from "lucide-react";

type BookingConfirmation = {
  id: number | string | null;
  services: Array<{ id: number | string; name: string; duration: number }>;
  date: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  technician: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

function getConfirmation(): BookingConfirmation | null {
  try {
    const value = sessionStorage.getItem("last-booking-confirmation");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export default function BookingSuccess() {
  const confirmation = getConfirmation();

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Booking Confirmed!</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Thank you for choosing 4U Nails. Your appointment has been successfully booked.
          </p>
          {confirmation?.id && (
            <p className="mt-3 text-sm text-muted-foreground">
              Confirmation number: <span className="font-semibold text-foreground">#{confirmation.id}</span>
            </p>
          )}
        </header>

        {confirmation ? (
          <Card className="card-elegant-no-hover mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Calendar className="h-5 w-5 text-primary" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                  <div><p className="font-medium">Date</p><p className="text-sm text-muted-foreground">{format(parseISO(confirmation.date), "EEEE, MMMM d, yyyy")}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div><p className="font-medium">Time</p><p className="text-sm text-muted-foreground">{confirmation.startTime} – {confirmation.endTime}</p></div>
                </div>
              </div>

              <Separator />
              <div>
                <div className="mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><p className="font-medium">Services</p></div>
                <div className="space-y-2">
                  {confirmation.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                      <span>{service.name}</span><Badge variant="outline">{service.duration} min</Badge>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-right text-sm font-medium">Total: {confirmation.totalDuration} minutes</p>
              </div>

              <Separator />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-primary" />
                  <div><p className="font-medium">Technician</p><p className="text-sm text-muted-foreground">{confirmation.technician}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-primary" />
                  <div><p className="font-medium">Booked for</p><p className="text-sm text-muted-foreground">{confirmation.customerName}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div><p className="font-medium">Phone</p><p className="text-sm text-muted-foreground">{confirmation.customerPhone}</p></div>
                </div>
              </div>

              {confirmation.notes && (
                <><Separator /><div><p className="mb-1 font-medium">Notes</p><p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{confirmation.notes}</p></div></>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6 text-center text-muted-foreground">
              Appointment details are no longer available in this browser session.
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-5">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div><p className="font-semibold">4U Nails Salon</p><p className="text-sm text-muted-foreground">123 Beauty Street, Downtown Beauty District<br />Phone: (555) 123-4567</p></div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" size="lg"><Link to="/">Back to Home</Link></Button>
          <Button asChild size="lg" className="btn-hero"><Link to="/book">Book Another Appointment</Link></Button>
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">Please arrive 10 minutes early. To reschedule or cancel, call (555) 123-4567.</p>
      </div>
    </main>
  );
}
