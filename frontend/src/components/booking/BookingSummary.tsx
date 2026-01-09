import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, MapPin, Sparkles } from "lucide-react";
import { useBookingStore } from "@/stores/bookingStore";
import { publicApi } from "@/lib/api"; // ✅ 用你的 publicApi.createAppointment
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingSummaryProps {
  onPrev: () => void;
  currentStep?: number;
  totalSteps?: number;
}

function addMinutesToHHMM(hhmm: string, minutesToAdd: number) {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  const total = h * 60 + m + minutesToAdd;
  const hh = String(Math.floor((total % (24 * 60)) / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

export function BookingSummary({ onPrev }: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    selectedTechnician,
    customerInfo,
    getTotalDuration,
    clearBooking,
  } = useBookingStore();

  // ✅ 防止直接进 Summary（store 空）导致循环：用 useEffect
  useEffect(() => {
    if (isSubmitting) return; // ✅ 提交中不要抢导航
    if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) {
      navigate("/book", { replace: true });
    }
  }, [navigate, isSubmitting, selectedServices.length, selectedDate, selectedTimeSlot]);


  const totalDuration = getTotalDuration();

  const timeText = useMemo(() => {
    const start = selectedTimeSlot?.startTime;
    if (!start) return "";
    const end = addMinutesToHHMM(start, totalDuration || 0);
    return end ? `${start} - ${end}` : start;
  }, [selectedTimeSlot, totalDuration]);

  // ✅ Cancel：清空 + 回首页
  const handleCancel = () => {
    clearBooking();
    navigate("/", { replace: true });
  };

  // ✅ Confirm：这里才提交到后端
  const handleConfirmBooking = async () => {
    try {
      if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
        toast({
          title: "Missing booking details",
          description: "Please select service, date and time.",
          variant: "destructive" as any,
        });
        navigate("/book");
        return;
      }

      const customer_name = (customerInfo.name || "").trim();
      const customer_phone = normalizePhone(customerInfo.phone || "");

      if (customer_name.length < 2 || customer_phone.length < 10) {
        toast({
          title: "Please check your info",
          description: "Name and phone are required.",
          variant: "destructive" as any,
        });
        return;
      }

      const start = selectedTimeSlot.startTime;
      const start_time = start.length === 5 ? `${start}:00` : start;

      // ✅ 先按你后端“单 service”结构提交（后面我们再升级成多 service）
      const payload = {
        customer_name,
        customer_phone,
        service_ids: selectedServices.map(s => Number(s.id)),

        technician: selectedTechnician?.id ?? null,
        date: selectedDate,
        start_time,
        notes: (customerInfo.notes || "").trim(),
      };

      setIsSubmitting(true);
      await publicApi.createAppointment(payload);

      toast({
        title: "Booking confirmed",
        description: "Your appointment has been created successfully.",
      });
      // ✅ 跳到成功页 + 清理 store
      navigate("/book/success", { replace: true });
      setTimeout(() => {
        clearBooking();
      }, 0);
      
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
      setIsSubmitting(false);
    }
  };

  if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Review Your Appointment
        </h2>
        <p className="text-muted-foreground">Confirm to finalize your booking</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Services */}
        <Card className="card-elegant-no-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Selected Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  {!!service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  )}
                </div>
                <Badge variant="outline">{service.duration} min</Badge>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>Total Duration:</span>
              <span className="text-primary">{totalDuration} minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="card-elegant-no-hover">
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
                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-foreground">Time</div>
                  <div className="text-sm text-muted-foreground">{timeText}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-foreground">Technician</div>
                <div className="text-sm text-muted-foreground">
                  {selectedTechnician ? selectedTechnician.name : "No preference"}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{customerInfo.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>{customerInfo.phone}</span>
              </div>
              {!!customerInfo.notes && (
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  {customerInfo.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salon */}
        <Card className="card-elegant-no-hover bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Bella Nails Salon</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              123 Beauty Street, Downtown Beauty District<br />
              Phone: (555) 123-4567
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={handleCancel} className="flex-1">
            Cancel Booking
          </Button>
          <Button variant="outline" onClick={onPrev} className="flex-1">
            Back to Edit Info
          </Button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                disabled={isSubmitting}
                className="flex-1 btn-hero"
              >
                {isSubmitting ? "Booking..." : "Confirm Appointment"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm your booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will submit your appointment request.
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div><span className="font-medium">Date:</span> {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d, yyyy") : "-"}</div>
                    <div><span className="font-medium">Time:</span> {timeText || "-"}</div>
                    <div><span className="font-medium">Technician:</span> {selectedTechnician ? selectedTechnician.name : "No preference"}</div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Go back</AlertDialogCancel>

                <AlertDialogAction
                  disabled={isSubmitting}
                  onClick={async () => {
                    // 关闭弹窗可选（更顺手）
                    setConfirmOpen(false);
                    await handleConfirmBooking();
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? "Submitting..." : "Yes, confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


        </div>

      </div>
    </div>
  );
}


