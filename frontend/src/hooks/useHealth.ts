// src/hooks/useHealth.ts
import { useQuery } from "@tanstack/react-query";
import { health } from "@/lib/api";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => (await health.ping()).data,
  });
}
