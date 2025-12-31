import { useEffect, useState } from "react";
import type { Service, ServiceCreate } from "../../types/service";
import { services as servicesApi, admin as adminApi } from "@/lib/api";


const emptyForm: ServiceCreate = {
  name: "",
  description: "",
  duration: 60,
  target_audience: "Everyone",
  image: "",
  is_active: true,
};

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceCreate>(emptyForm);

  async function reload() {
    const list = await servicesApi.getAdmin(); // ✅ 返回 Service[]
    setItems(list);
  }

  useEffect(() => {
    reload().catch((e) => setError(e?.message ?? String(e)));
  }, []);

  async function onCreate() {
    setError("");
    try {
      await adminApi.createService(form);
      setForm(emptyForm);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  async function onDelete(id: number) {
    setError("");
    try {
      await adminApi.deleteService(id);
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  async function toggleActive(s: Service) {
    setError("");
    try {
      await adminApi.updateService(String(s.id), { is_active: !s.is_active });
      await reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Services (Admin)</h1>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Add service</h2>
        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Duration (min)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
          />
          <input
            placeholder="Target audience"
            value={form.target_audience}
            onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
          />
          <input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>

          <button onClick={onCreate} disabled={!form.name.trim()}>
            Create
          </button>
        </div>
      </div>

      <h2>Existing services</h2>
      <ul>
        {items.map((s) => (
          <li key={s.id} style={{ marginBottom: 12 }}>
            <b>{s.name}</b> — {s.duration} min — {s.is_active ? "Active" : "Inactive"}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={() => toggleActive(s)}>
                Toggle Active
              </button>
              <button onClick={() => onDelete(s.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
