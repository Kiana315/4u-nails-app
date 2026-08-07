import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { admin as adminApi } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

import { ArrowLeft, Plus, Trash2, RefreshCw, User, CalendarDays, Settings2 } from "lucide-react";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const WEEKDAYS: { key: WeekdayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
];

type Technician = {
  id: number;
  name: string;
  active: boolean;
  working_days?: WeekdayKey[]; // ✅ 新增
};

function normalizeDays(days: any): WeekdayKey[] {
  if (!Array.isArray(days)) return [];
  const valid = new Set(WEEKDAYS.map((d) => d.key));
  return days.map(String).filter((d) => valid.has(d as WeekdayKey)) as WeekdayKey[];
}

function formatDays(days: WeekdayKey[]) {
  if (!days || days.length === 0) return "No days set";
  const order = WEEKDAYS.map((d) => d.key);
  const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return sorted.map((k) => WEEKDAYS.find((d) => d.key === k)!.short).join(", ");
}

export default function TechAdminPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [newWorkingDays, setNewWorkingDays] = useState<WeekdayKey[]>(["mon", "tue", "wed", "thu", "fri"]); // 默认周一到周五
  const [toDelete, setToDelete] = useState<Technician | null>(null);

  // Edit working days dialog
  const [editing, setEditing] = useState<Technician | null>(null);
  const [editingDays, setEditingDays] = useState<WeekdayKey[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  const allDays = useMemo(() => WEEKDAYS.map((d) => d.key), []);

  function toggleDay(setter: (fn: (prev: WeekdayKey[]) => WeekdayKey[]) => void, day: WeekdayKey) {
    setter((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function reload() {
    setError("");
    setLoading(true);
    try {
      const list = await adminApi.getTechnicians(); // Technician[]
      const normalized: Technician[] = (Array.isArray(list) ? list : []).map((t: any) => ({
        id: t.id,
        name: t.name,
        active: !!t.active,
        working_days: normalizeDays(t.working_days),
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    setError("");
    setSaving(true);
    try {
      await adminApi.createTechnician({
        name,
        active,
        working_days: newWorkingDays, // ✅ 发送工作日
      });
      setName("");
      setActive(true);
      setNewWorkingDays(["mon", "tue", "wed", "thu", "fri"]);
      toast({ title: "Technician created", description: "Staff member added." });
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
      toast({
        title: "Create failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive" as any,
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: Technician) {
    setError("");
    try {
      await adminApi.updateTechnician(String(t.id), { active: !t.active });
      toast({
        title: !t.active ? "Activated" : "Deactivated",
        description: `${t.name} is now ${!t.active ? "active" : "inactive"}.`, duration: 6000,
      });
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
      toast({
        title: "Update failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive" as any,
        duration: 6000,
      });
    }
  }

  async function onDelete(id: number) {
    setError("");
    try {
      await adminApi.deleteTechnician(id);
      toast({ title: "Deleted", description: "Technician removed.", duration: 6000 });
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
      toast({
        title: "Delete failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive" as any,
        duration: 6000,
      });
    }
  }

  function openEditDays(t: Technician) {
    setEditing(t);
    setEditingDays(normalizeDays(t.working_days));
  }

  async function saveEditDays() {
    if (!editing) return;
    setError("");
    setEditSaving(true);
    try {
      await adminApi.updateTechnician(String(editing.id), { working_days: editingDays });
      toast({ title: "Saved", description: `Updated working days for ${editing.name}.` });
      setEditing(null);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
      toast({
        title: "Save failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive" as any,
        duration: 6000,
      });
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Manage Staff</h1>
              <p className="text-muted-foreground mt-1">Add, enable/disable, set working days, and remove technicians.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="btn-hero self-start md:self-auto" onClick={reload} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create */}
          <Card className="card-elegant-no-hover lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-serif">Add Technician</CardTitle>
              <CardDescription>This will appear in booking staff selection.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tech-name">Name</Label>
                <Input
                  id="tech-name"
                  placeholder="e.g., Maria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Inactive staff won’t be selectable.</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              {/* ✅ Working days (Create) */}
              <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Working Days</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Full-day shifts based on store opening hours. Choose which days this staff member works.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map((d) => (
                    <label key={d.key} className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={newWorkingDays.includes(d.key)}
                        onCheckedChange={() => toggleDay(setNewWorkingDays, d.key)}
                      />
                      <span className="text-sm">{d.short}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewWorkingDays(allDays)}>
                    Select all
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewWorkingDays([])}>
                    Clear
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{formatDays(newWorkingDays)}</span>
                </div>
              </div>

              <Button
                className="w-full btn-hero"
                onClick={onCreate}
                disabled={saving || !name.trim() || newWorkingDays.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Creating..." : "Create"}
              </Button>
            </CardContent>
          </Card>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">Technicians</h2>
              <Badge variant="secondary">{items.length} total</Badge>
            </div>

            {loading ? (
              <Card className="card-elegant">
                <CardContent className="p-6">
                  <div className="animate-pulse text-muted-foreground">Loading technicians...</div>
                </CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card className="card-elegant">
                <CardContent className="p-10 text-center">
                  <p className="font-medium text-foreground">No technicians yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first staff member on the left.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((t) => (
                  <Card key={t.id} className="card-elegant">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-semibold text-foreground">{t.name}</h3>
                            <p className="text-sm text-muted-foreground">Technician</p>
                          </div>
                        </div>

                        <Badge variant={t.active ? "default" : "secondary"}>{t.active ? "Active" : "Inactive"}</Badge>
                      </div>

                      {/* ✅ Show working days */}
                      <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Working days:</span>
                        </div>
                        <span className="text-sm font-medium">{formatDays(normalizeDays(t.working_days))}</span>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => toggleActive(t)}>
                          {t.active ? "Deactivate" : "Activate"}
                        </Button>

                        <Button variant="outline" className="flex-1" onClick={() => openEditDays(t)}>
                          <Settings2 className="w-4 h-4 mr-2" />
                          Working Days
                        </Button>
                      </div>

                      <div className="mt-2">
                        <AlertDialog
                          open={toDelete?.id === t.id}
                          onOpenChange={(open) => setToDelete(open ? t : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" onClick={() => setToDelete(t)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this technician?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <span className="font-medium">{t.name}</span>. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await onDelete(t.id);
                                  setToDelete(null);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirm Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Edit Working Days Dialog */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Edit Working Days</DialogTitle>
              <DialogDescription>
                {editing ? (
                  <>
                    Set which days <span className="font-medium">{editing.name}</span> works. Full-day shifts follow store
                    opening hours.
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {WEEKDAYS.map((d) => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={editingDays.includes(d.key)}
                      onCheckedChange={() => toggleDay(setEditingDays, d.key)}
                    />
                    <span className="text-sm">{d.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingDays(allDays)}>
                  Select all
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingDays([])}>
                  Clear
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{formatDays(editingDays)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={editSaving}>
                Cancel
              </Button>
              <Button className="btn-hero" onClick={saveEditDays} disabled={editSaving || editingDays.length === 0}>
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
