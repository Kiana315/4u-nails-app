import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/hooks/use-toast";
import { admin, services as servicesApi } from "@/lib/api";

export default function AdminNewAppointment() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState({
    date: today,
    start_time: "09:00",
    customer_name: "",
    customer_phone: "",
    notes: "",
    technician: "none" as "none" | string, // "none" = No preference
    serviceIds: [] as string[], // store as string ids for easy checkbox compare
  });

  // services
  const { data: allServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ["adminServices"],
    queryFn: servicesApi.getAdmin, // should return array
  });

  // technicians
  const { data: technicians = [], isLoading: loadingTechs } = useQuery({
    queryKey: ["adminTechnicians"],
    queryFn: admin.getTechnicians, // should return array
  });

  const toggleService = (sid: string) => {
    setForm((prev) => {
      const cur = new Set(prev.serviceIds);
      if (cur.has(sid)) cur.delete(sid);
      else cur.add(sid);
      return { ...prev, serviceIds: Array.from(cur) };
    });
  };

  const selectedServicesPreview = useMemo(() => {
    const map = new Map((allServices as any[]).map((s) => [String(s.id), s.name]));
    return form.serviceIds.map((sid) => map.get(sid) ?? `#${sid}`).join(", ");
  }, [allServices, form.serviceIds]);

  const mutation = useMutation({
    mutationFn: async () => {
      // ✅ payload aligns with your AppointmentCreateSerializer idea:
      // customer_name, customer_phone, service_ids, technician (nullable), date, start_time, notes
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        service_ids: form.serviceIds.map((x) => Number(x)),
        technician: form.technician === "none" ? null : Number(form.technician),
        date: form.date,
        start_time: form.start_time.length === 5 ? `${form.start_time}:00` : form.start_time, // ensure HH:MM:SS
        notes: form.notes ?? "",
      };

      return admin.createAppointment(payload);
    },
    onSuccess: async () => {
      toast({
        title: "Created",
        description: "New appointment created successfully.",
        duration: 2500,
      });

      // 刷新 dashboard 今日列表
      await qc.invalidateQueries({ queryKey: ["adminAppointments", today] });
      await qc.invalidateQueries({ queryKey: ["adminAppointments"] });

      navigate("/admin"); // 如果你的 dashboard 路径不同改一下
    },
    onError: (e: any) => {
      toast({
        title: "Create failed",
        description: e?.response?.data?.detail ?? e?.message ?? "Please try again.",
        duration: 3000,
      });
    },
  });

  const canSubmit =
    form.customer_name.trim().length > 0 &&
    form.customer_phone.trim().length > 0 &&
    form.date &&
    form.start_time &&
    form.serviceIds.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              New Appointment
            </h1>
            <p className="text-sm text-muted-foreground">
              Quick create (no multi-step booking flow).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!canSubmit || mutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>

        <Card className="card-elegant-no-hover">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Start time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>

            {/* Technician */}
            <div className="space-y-2">
              <Label>Technician</Label>
              <Select
                value={form.technician}
                onValueChange={(v) => setForm({ ...form, technician: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {(technicians as any[]).map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(loadingTechs) && (
                <p className="text-xs text-muted-foreground">Loading technicians...</p>
              )}
            </div>

            {/* Customer name */}
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="e.g. Alex"
              />
            </div>

            {/* Customer phone */}
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="e.g. 5872162120"
              />
            </div>

            {/* Services */}
            <div className="md:col-span-2">
              <Label className="mb-2 block">Services</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground mb-3">All Services</p>

                  <div className="space-y-2 max-h-[320px] overflow-auto pr-2">
                    {(allServices as any[]).map((s) => {
                      const sid = String(s.id);
                      const checked = form.serviceIds.includes(sid);

                      return (
                        <div
                          key={sid}
                          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleService(sid)}
                          />
                          <button
                            type="button"
                            onClick={() => toggleService(sid)}
                            className="text-sm text-foreground text-left flex-1"
                          >
                            {s.name}
                          </button>
                        </div>
                      );
                    })}

                    {loadingServices && (
                      <p className="text-xs text-muted-foreground">Loading services...</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Selected ({form.serviceIds.length})
                  </p>
                  {form.serviceIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Select at least one service.</p>
                  ) : (
                    <p className="text-sm text-foreground">{selectedServicesPreview}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Optional notes..."
              />
            </div>

            {!canSubmit && (
              <p className="md:col-span-2 text-xs text-muted-foreground">
                Required: date, start time, customer name, phone, and at least one service.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
