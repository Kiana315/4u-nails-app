import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, MapPin } from "lucide-react";
import { useBookingStore } from "@/stores/bookingStore";
import { Navbar } from "@/components/common/Navbar";
import { publicApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface BookingConfirmProps {
  onPrev: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

function normalizePhone(raw: string) {
  return (raw || "").replace(/\D/g, "");
}

function addMinutesToHHMM(hhmm: string, minutesToAdd: number) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + minutesToAdd;
  const hh = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// ✅ 不要 BookingConfirmProps，不要 onPrev
export default function BookingConfirm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    selectedTechnician,
    customerInfo,
    getTotalDuration,
    clearBooking,
  } = useBookingStore();

  // 防止直接进 confirm（store 空）
  useEffect(() => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) {
      navigate("/book", { replace: true });
    }
  }, [navigate, selectedServices.length, selectedDate, selectedTimeSlot]);

  const totalDuration = getTotalDuration();

  const timeRangeText = useMemo(() => {
    const start = selectedTimeSlot?.startTime;
    if (!start) return "";
    const end = (selectedTimeSlot as any)?.endTime || addMinutesToHHMM(start, totalDuration || 0);
    return end ? `${start} - ${end}` : start;
  }, [selectedTimeSlot, totalDuration]);

  const handleConfirm = async () => {
    try {
      if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
        toast({
          title: "Missing booking details",
          description: "Please select service, date and time.",
          variant: "destructive" as any,
        });
        navigate("/book", { replace: true });
        return;
      }

      const start = selectedTimeSlot.startTime;
      const start_time = start.length === 5 ? `${start}:00` : start;

      const payload = {
        customer_name: (customerInfo.name || "").trim(),
        customer_phone: normalizePhone(customerInfo.phone || ""),
        service: Number(selectedServices[0].id),
        technician: selectedTechnician?.id ?? null,
        date: selectedDate,
        start_time,
        notes: (customerInfo.notes || "").trim(),
      };

      if (!payload.customer_name || payload.customer_phone.length < 10) {
        toast({
          title: "Please check your info",
          description: "Name and phone are required.",
          variant: "destructive" as any,
        });
        return;
      }

      setSubmitting(true);
      await publicApi.createAppointment(payload);

      toast({
        title: "Booking confirmed",
        description: "Your appointment has been created successfully.",
      });

      // ✅ 关键：先跳转，再清空（否则会被“store空就回/book”逻辑拦截）
      navigate("/book/success", { replace: true });
      setTimeout(() => clearBooking(), 0);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        (e?.response?.data ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Please try again.";

      toast({
        title: "Booking failed",
        description: msg,
        variant: "destructive" as any,
        duration: 7000,
      });
      console.error("Booking failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    // ✅ 回到 /book 并让 BookingFlow 打开到 Step 3（Your Info）
    navigate("/book", { state: { step: 3 } });
  };

  if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) return null;


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
              <p className="text-muted-foreground">Please review your booking details before confirming</p>
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
                      <div
                        key={service.id}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.duration} minutes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total duration: {totalDuration} minutes
                  </div>
                </div>

                <Separator />

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-sm text-muted-foreground">{timeRangeText}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Technician */}
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Technician</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTechnician ? selectedTechnician.name : "No preference"}
                    </div>
                  </div>
                </div>

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
                    <span className="font-medium">4U Nails Salon</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    123 Beauty Street, Downtown Beauty District
                    <br />
                    Phone: (555) 123-4567
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" onClick={handleEdit} className="flex-1" disabled={submitting}>
                    Back to Edit Info
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1 btn-hero" disabled={submitting}>
                    {submitting ? "Confirming..." : "Confirm Appointment"}
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
