import { useEffect, useMemo, useState } from "react";
import type { Service, ServiceCreate } from "../../types/service";
import { services as servicesApi, admin as adminApi } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Power, RefreshCw, Image as ImageIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";
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

const SERVICE_CATEGORIES = [
  "Manicure",
  "Pedicure",
  "Nail Art",
  "Waxing",
  "Other",
];

const CATEGORY_ORDER = [
  "all",
  "Manicure",
  "Pedicure",
  "Nail Art",
  "Waxing",
  "Other",
];

const emptyForm: ServiceCreate = {
  name: "",
  description: "",
  duration: 60,
  category: "Manicure",
  target_audience: "Everyone",
  image: "",
  is_active: true,
};

function isValidUrl(s: string) {
  try {
    if (!s?.trim()) return false;
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export default function ServicesAdminPage() {
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [items, setItems] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceCreate>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  async function reload() {
    setError("");
    setLoading(true);
    try {
      const list = await servicesApi.getAdmin(); // ✅ 返回 Service[]
      setItems(list);
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
      await adminApi.createService(form);
      setForm(emptyForm);
      toast({ title: "Service created", description: "Your service has been added." });
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

  async function onDelete(id: number) {
    setError("");
    try {
      await adminApi.deleteService(id);
      toast({ title: "Deleted",
        description: "Service removed.",
        duration: 5000 });
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

  async function toggleActive(s: Service) {
    setError("");
    try {
      await adminApi.updateService(String(s.id), { is_active: !s.is_active });
      toast({
        title: !s.is_active ? "Activated" : "Deactivated",
        description: `${s.name} is now ${!s.is_active ? "active" : "inactive"}.`,
        duration: 6000,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Manage Services</h1>
            <p className="text-muted-foreground mt-1">Create, update, and publish the services shown to customers.</p>
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

        {/* Error */}
        {error && (
          <Card className="mb-6 border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create form */}
          <Card className="card-elegant-no-hover lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-serif">Add a Service</CardTitle>
              <CardDescription>These services will appear on the public Services page.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Gel Manicure"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Short description shown to customers"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>

                <Select
                  value={form.category ?? "Manicure"}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target audience</Label>
                  <Input
                    id="audience"
                    placeholder="Everyone"
                    value={form.target_audience}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <div className="rounded-lg border bg-muted/30 overflow-hidden">
                  <div className="aspect-video flex items-center justify-center text-muted-foreground">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="w-4 h-4" />
                        Image preview
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Only active services should be shown to customers.</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>

              <Button
                className="w-full btn-hero"
                onClick={onCreate}
                disabled={saving || !form.name.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Creating..." : "Create Service"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Tip: Use a short description. Keep duration realistic (e.g., 45–120 mins).
              </p>
            </CardContent>
          </Card>

          {/* Existing list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold mt-8 mb-3">Existing services</h2>
              <Badge variant="secondary">{items.length} total</Badge>
            </div>

            {loading ? (
              <Card className="card-elegant">
                <CardContent className="p-6">
                  <div className="animate-pulse text-muted-foreground">Loading services...</div>
                </CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card className="card-elegant">
                <CardContent className="p-10 text-center">
                  <p className="font-medium text-foreground">No services yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first service on the left panel.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((s) => (
                  <Card key={s.id} className="card-elegant overflow-hidden">
                    <div className="aspect-video bg-muted/30 overflow-hidden">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          No image
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-foreground">{s.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {s.description || "No description"}
                          </p>
                        </div>

                        <Badge variant={s.is_active ? "default" : "secondary"}>
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-5 text-sm text-muted-foreground">
                        <span>{s.duration} min</span>
                        <span>{s.target_audience || "Everyone"}</span>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => toggleActive(s)}
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {s.is_active ? "Deactivate" : "Activate"}
                        </Button>

                        <AlertDialog open={toDelete?.id === s.id} onOpenChange={(open) => setToDelete(open ? s : null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1" onClick={() => setToDelete(s)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <span className="font-medium">{s.name}</span>.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await onDelete(s.id);
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
