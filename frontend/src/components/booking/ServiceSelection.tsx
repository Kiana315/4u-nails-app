import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, Palette } from "lucide-react";
import { services } from "@/lib/api";
import { useBookingStore } from "@/stores/bookingStore";
import type { Service } from "@/types";

interface ServiceSelectionProps {
  onNext: () => void;
  preselectedService?: Service;
}

export function ServiceSelection({ onNext, preselectedService }: ServiceSelectionProps) {
  const { selectedServices, addService, removeService } = useBookingStore();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["services", "public"],
    queryFn: services.getAll, // AxiosResponse
    retry: false,
  });

  // ✅ 安全解析：兼容数组 / DRF 分页
  const availableServices: Service[] = (() => {
    const raw: any = response?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
  })();

  // ✅ 只处理一次 preselected（避免重复 add）
  const preselectHandled = useRef(false);
  useEffect(() => {
    if (!preselectHandled.current && preselectedService) {
      addService(preselectedService);
      preselectHandled.current = true;
    }
  }, [preselectedService, addService]);

  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  const toggle = (service: Service) => {
    isSelected(service.id) ? removeService(service.id) : addService(service);
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold">Select Your Services</h2>
        <p className="text-muted-foreground">Choose one or more services for your appointment</p>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">Loading services…</div>
      )}

      {isError && (
        <div className="text-center text-sm text-destructive">
          Failed to load services. Please try again later.
        </div>
      )}

      {!isLoading && !isError && availableServices.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No services available right now.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && availableServices.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {availableServices.map((service) => (
            <Card
              key={service.id}
              className={`card-elegant group overflow-hidden cursor-pointer transition ${
                isSelected(service.id) ? "ring-2 ring-primary" : "hover:shadow-elegant"
              }`}
              onClick={() => toggle(service)}
            >
              <div className="aspect-video overflow-hidden rounded-t-2xl">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox checked={isSelected(service.id)} onCheckedChange={() => toggle(service)} />
                    <h3 className="font-serif text-xl font-semibold text-card-foreground">
                      {service.name}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {service.targetAudience ?? "General"}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.description || ""}
                </p>

                <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {service.targetAudience ?? "Everyone"}
                  </div>
                </div>
              </CardContent>
            </Card>

          ))}
        </div>
      )}

      {selectedServices.length > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="p-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Selected Services
              </h3>
              <span className="text-sm">{totalDuration} min</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button className="btn-hero" onClick={onNext} disabled={selectedServices.length === 0}>
          Continue to Date & Time
        </Button>
      </div>
    </div>
  );
}
