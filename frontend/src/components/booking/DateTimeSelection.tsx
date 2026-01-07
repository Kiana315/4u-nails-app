import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, User } from "lucide-react";
import { slots, publicApi } from "@/lib/api";
import { useBookingStore } from "@/stores/bookingStore";
import type { TimeSlot, Technician } from "@/types";
import { addMinutes, format } from "date-fns";

interface DateTimeSelectionProps {
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const WEEKDAY_MAP: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const unwrapList = (data: any) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

function toWeekdayKey(dateStr: string): WeekdayKey {
  // 用本地 00:00 避免时区导致星期偏移
  const d = new Date(`${dateStr}T00:00:00`);
  return WEEKDAY_MAP[d.getDay()];
}

function normalizeWorkingDays(days: any): WeekdayKey[] {
  if (!Array.isArray(days)) return [];
  const valid = new Set<WeekdayKey>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  return days.map(String).filter((x) => valid.has(x as WeekdayKey)) as WeekdayKey[];
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
    selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined
  );

  // ✅ 总服务时长（用来计算 endTime）
  const totalDurationMin = useMemo(() => {
    return selectedServices.reduce((sum: number, s: any) => sum + (Number(s.duration) || 0), 0);
  }, [selectedServices]);

  // ✅ 当前选中日期对应的 weekday
  const selectedDayKey = useMemo(() => {
    return selectedDate ? toWeekdayKey(selectedDate) : null;
  }, [selectedDate]);

  // 1) Technicians（可不选）
  const { data: techRes, isLoading: techLoading } = useQuery({
    queryKey: ["technicians-public"],
    queryFn: () => publicApi.getTechnicians(),
    retry: false,
  });

  const technicians: Technician[] = useMemo(() => {
    const raw = techRes?.data ?? techRes;
    const list = unwrapList(raw);
    return list
      .filter((t: any) => t.active !== false && t.is_active !== false)
      .map((t: any) => ({
        ...t,
        working_days: normalizeWorkingDays(t.working_days),
      }));
  }, [techRes]);

  // ✅ 判断技师当天是否上班：没设置 working_days → 默认每天都上班（更友好）
  const isTechWorkingThatDay = (t: Technician) => {
    if (!selectedDayKey) return true; // 还没选日期，不禁用
    const days = normalizeWorkingDays((t as any).working_days);
    if (days.length === 0) return true;
    return days.includes(selectedDayKey);
  };

  // ✅ 日期变化后，如果当前选中的技师当天不上班 → 自动清空技师与时间
  useEffect(() => {
    if (!selectedDate) return;
    if (selectedTechnician && !isTechWorkingThatDay(selectedTechnician)) {
      setSelectedTechnician(null);
      setSelectedTimeSlot(null);
    } else {
      // 日期变化也要清 time（你原本就做了，这里再兜底一次）
      setSelectedTimeSlot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // 2) Slots：必须先选 date；tech 可选
  const serviceId = selectedServices[0]?.id
    ? String(selectedServices[0].id)
    : "";

  const techId = selectedTechnician?.id
    ? String(selectedTechnician.id)
    : "";

  const dateStr = selectedDate ?? "";

  const { data: slotsRes, isLoading: slotsLoading, isError: slotsError } = useQuery({
    queryKey: ["slots", dateStr, serviceId, techId],
    queryFn: () =>
      slots.getAvailable({
        date: dateStr,
        serviceId,
        technicianId: techId || undefined,
      }),
    enabled: !!dateStr && !!serviceId,
    retry: false,
  });

  /**
   * ✅ 兼容后端 PublicSlotsView 返回：
   *   { slots: ["10:00","10:30"...], stepMin: 30, ... }
   * 转成前端 TimeSlot[]：{ id, startTime, endTime, isAvailable: true }
   */
  const availableSlots: TimeSlot[] = useMemo(() => {
    const raw = slotsRes?.data ?? slotsRes;

    // 后端返回 { slots: ["10:00", ...] }
    const arr = Array.isArray(raw?.slots) ? raw.slots : [];

    return arr.map((start: string) => ({
      id: start,            // 用 startTime 做唯一 id
      startTime: start,
      endTime: undefined,   // 如需 endTime 我也可以帮你算
      isAvailable: true,
    })) as any;
  }, [slotsRes]);



  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setCalendarDate(date);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setSelectedTimeSlot(null);
  };

  const handleTechnicianSelect = (tech: Technician | null) => {
    setSelectedTechnician(tech);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const filteredSlots = availableSlots;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Select Date, Technician & Time
        </h2>
        <p className="text-muted-foreground">
          Pick a date, optionally choose a technician, then select an available time slot.
        </p>
      </div>

      {/* Row 1: Date + Tech; Row 2: Time */}
      <div className="space-y-8">
        {/* Date */}
        <Card className="card-elegant mx-auto max-w-[360px]">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Choose a Date
            </h3>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Technician */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Choose a Technician (Optional)</h3>

            {!selectedDate ? (
              <div className="text-center py-6 text-muted-foreground">
                <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : techLoading ? (
              <div className="text-muted-foreground">Loading technicians...</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* No preference */}
                <button
                  type="button"
                  onClick={() => handleTechnicianSelect(null)}
                  className={[
                    "text-left rounded-2xl border p-4 transition",
                    !selectedTechnician
                      ? "ring-2 ring-primary border-primary/40 bg-primary/5"
                      : "hover:bg-muted/40",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">No preference</p>
                      <p className="text-sm text-muted-foreground">Any available technician</p>
                    </div>
                    <Badge variant="secondary">Any</Badge>
                  </div>
                </button>

                {/* Real technicians */}
                {technicians.map((t) => {
                  const isSelected = selectedTechnician?.id === t.id;
                  const disabled = !isTechWorkingThatDay(t);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        handleTechnicianSelect(t);
                      }}
                      className={[
                        "text-left rounded-2xl border p-4 transition",
                        disabled ? "opacity-50 cursor-not-allowed bg-muted/10" : "hover:bg-muted/40",
                        isSelected ? "ring-2 ring-primary border-primary/40 bg-primary/5" : "",
                      ].join(" ")}
                      aria-disabled={disabled}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">{t.name}</p>
                          {disabled ? <Badge variant="secondary">Off</Badge> : <Badge variant="default">On</Badge>}
                        </div>

                        <div className="h-px bg-border/60" />

                        <div className="space-y-2">
                          {Array.isArray((t as any).working_days) && (t as any).working_days.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Working days: </span>
                              {(t as any).working_days.join(", ")}
                            </div>
                          )}

                          {!!(t as any).specialties?.length && (
                            <div className="flex flex-wrap gap-1">
                              {(t as any).specialties.slice(0, 3).map((sp: string) => (
                                <Badge key={sp} variant="secondary" className="text-xs">
                                  {sp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>


                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time slots full width */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Available Times</h3>
              {selectedDate && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(`${selectedDate}T00:00:00`), "MMM d, yyyy")}
                </span>
              )}
            </div>

            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : slotsLoading ? (
              <div className="text-muted-foreground">Loading time slots...</div>
            ) : slotsError ? (
              <div className="text-destructive">Failed to load time slots.</div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available slots for this date</p>
                <p className="text-sm">Please try another date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {filteredSlots.map((slot: any) => {
                  const isSelected = selectedTimeSlot?.id === slot.id;
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col items-center space-y-1 ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      <div className="font-medium">{slot.startTime}</div>
                      {slot.endTime && <div className="text-xs opacity-75">{slot.endTime}</div>}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {selectedDate && selectedTimeSlot && (
        <Card className="card-elegant bg-accent/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Your Appointment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {format(new Date(`${selectedDate}T00:00:00`), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {selectedTimeSlot.startTime}
                  {selectedTimeSlot.endTime ? ` - ${selectedTimeSlot.endTime}` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technician:</span>
                <span className="font-medium">
                  {selectedTechnician ? selectedTechnician.name : "No preference"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back to Services
        </Button>

        <Button onClick={onNext} disabled={!selectedDate || !selectedTimeSlot} className="btn-hero">
          Continue to Your Info
        </Button>
      </div>
    </div>
  );
}
