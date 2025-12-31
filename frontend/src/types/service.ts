export type Service = {
  id: number;
  name: string;
  description: string;
  duration: number;
  target_audience: string;
  image: string;
  is_active: boolean;
};

export type ServiceCreate = Omit<Service, "id">;
export type ServiceUpdate = Partial<ServiceCreate>;
