import { publicApi, authApi } from "../api";
import type { Technician } from "../types/technician";

export async function fetchActiveTechnicians() {
  const res = await publicApi.get<Technician[]>("/api/technicians/");
  return res.data;
}

// 可选：给后台管理页用
export async function fetchAdminTechnicians() {
  const res = await authApi.get<Technician[]>("/api/admin/technicians/");
  return res.data;
}
