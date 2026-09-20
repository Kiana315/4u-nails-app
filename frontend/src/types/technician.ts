export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Technician = {
  id: string;
  name: string;
  active: boolean;
  services: number[];
  working_days: WeekdayKey[]; // ✅ 新增
};
