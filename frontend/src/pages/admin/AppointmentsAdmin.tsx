import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { admin, services as servicesApi } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";


const STATUS_OPTIONS = ["created", "pending", "completed", "cancelled"] as const;



// 组件列表
export default function AdminAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: appt, isLoading, isError } = useQuery({
    queryKey: ["adminAppointment", id],
    queryFn: async () => admin.getAppointmentById(id!),
    enabled: !!id,
  });
  const { data: allServices = [] } = useQuery({
    queryKey: ["adminServices"],
    queryFn: servicesApi.getAdmin,
  });

  // 用 appt 初始化一个可编辑的 form（首次加载后填充）
  const [form, setForm] = useState<any>(null);

  // 当 appt 第一次到达时，创建 form（避免每次 render 重置用户输入）
  useEffect(() => {
    if (appt && !form) {
      setForm({
        customer_name: appt.customer_name ?? "",
        customer_phone: appt.customer_phone ?? "",
        date: appt.date ?? "",
        start_time: appt.start_time ?? "",
        end_time: appt.end_time ?? "",
        status: appt.status ?? "created",
        notes: appt.notes ?? "",
        services: Array.isArray(appt.services) ? appt.services.map(String) : [],
        technician: appt.technician ?? null,
        technician_display: appt.technician_display ?? "",
        no_preference: !!appt.no_preference,
      });
    }
  }, [appt, form]);
  
  const toggleService = (serviceId: string) => {
    setForm((prev: any) => {
      const cur = new Set<string>(prev.services || []);
      if (cur.has(serviceId)) cur.delete(serviceId);
      else cur.add(serviceId);
      return { ...prev, services: Array.from(cur) };
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      // 只 PATCH 允许编辑的字段（避免把 display 字段写回去）
      const patch = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        status: form.status,
        notes: form.notes,
        services: (form.services || []).map((x: string) => Number(x)),

        // 如果你允许改技师/偏好，再放开：
        // technician: form.technician,
        // no_preference: form.no_preference,
      };
      return admin.updateAppointment(id!, patch);
    },
    onSuccess: async () => {
      toast({ title: "Saved", description: "Appointment updated successfully.", duration: 3000 });
      await qc.invalidateQueries({ queryKey: ["adminAppointment", id] });
      await qc.invalidateQueries({ queryKey: ["adminAppointments"] }); // 列表也刷新
    },
    onError: (e: any) => {
      toast({ title: "Save failed", description: e?.message ?? "Please try again.", duration: 3000 });
    },
  });

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
          Loading appointment...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-sm text-destructive">
          Failed to load appointment.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Appointment #{id}</h1>
            <p className="text-muted-foreground text-sm">
              Technician: {form.technician_display || "—"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>

        <Card className="card-elegant-no-hover">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {/* Customer */}
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              />
            </div>

            {/* Date/Time */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

        
            {/* Services (checkbox editor) */}
            <div className="md:col-span-2">
              <Label className="mb-2 block">Services</Label>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 左侧：所有服务 */}
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground mb-3">All Services</p>

                  <div className="space-y-2 max-h-[320px] overflow-auto pr-2">
                    {(allServices as any[]).map((s) => {
                      const sid = String(s.id);
                      const checked = (form.services || []).includes(sid);

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
                  </div>
                </div>

                {/* 右侧：已选服务 */}
                <div className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Selected ({(form.services || []).length})
                  </p>

                  {(form.services || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services selected.</p>
                  ) : (
                    <div className="space-y-2">
                      {(form.services || []).map((sid: string) => {
                        const service = (allServices as any[]).find((x) => String(x.id) === sid);

                        return (
                          <div
                            key={sid}
                            className="flex items-center justify-between rounded-md bg-background px-3 py-2"
                          >
                            <span className="text-sm text-foreground">
                              {service?.name ?? `#${sid}`}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 px-2 underline-offset-4 hover:underline"
                              onClick={() => toggleService(sid)}
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
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
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
