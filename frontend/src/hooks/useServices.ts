import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export type Service = {
  id: number;
  name: string;
  duration_min: number;
  category?: string;
  highlight?: string;
  active: boolean;
};

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => (await apiClient.get("/services/")).data,
  });
}
