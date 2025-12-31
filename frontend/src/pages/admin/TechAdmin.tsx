import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { admin as adminApi } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { ArrowLeft, Plus, Trash2, RefreshCw, User } from "lucide-react";
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

type Technician = {
  id: number;
  name: string;
  active: boolean;
};

export default function TechAdminPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [toDelete, setToDelete] = useState<Technician | null>(null);

  async function reload() {
    setError("");
    setLoading(true);
    try {
      const list = await adminApi.getTechnicians(); // 期望返回 Technician[]
      setItems(Array.isArray(list) ? list : []);
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
      await adminApi.createTechnician({ name, active });
      setName("");
      setActive(true);
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
        description: `${t.name} is now ${!t.active ? "active" : "inactive"}.`,
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
      toast({ title: "Deleted", description: "Technician removed." });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Manage Staff</h1>
              <p className="text-muted-foreground mt-1">Add, enable/disable, and remove technicians.</p>
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

              <Button className="w-full btn-hero" onClick={onCreate} disabled={saving || !name.trim()}>
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

                      <div className="flex gap-2 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => toggleActive(t)}>
                          {t.active ? "Deactivate" : "Activate"}
                        </Button>

                        <AlertDialog
                          open={toDelete?.id === t.id}
                          onOpenChange={(open) => setToDelete(open ? t : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1" onClick={() => setToDelete(t)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this technician?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <span className="font-medium">{t.name}</span>.
                                This action cannot be undone.
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
      </div>
    </div>
  );
}
