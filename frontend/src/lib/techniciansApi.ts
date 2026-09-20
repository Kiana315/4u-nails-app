import { apiClient } from "./api";
import type { Technician } from "../types/technician";

export async function fetchActiveTechnicians() {
  const res = await apiClient.get<Technician[]>("/technicians/");
  return res.data;
}

// 可选：给后台管理页用
export async function fetchAdminTechnicians() {
  const res = await apiClient.get<Technician[]>("/admin/technicians/");
  return res.data;
}
