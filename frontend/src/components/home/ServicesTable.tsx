// src/home/ServicesTable.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services as api } from '@/lib/api';
import type { Service } from '@/types';

// -----------------------
// 1) 你的预设 mock（保留）
// -----------------------
const mockServices: Service[] = [
  { id: '1', name: 'Classic Manicure', description: 'Professional nail shaping, cuticle care, and polish application', duration: 45, category: 'Manicure', targetAudience: 'Everyone', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop', isActive: true },
  { id: '2', name: 'Gel Manicure', description: 'Long-lasting gel polish with UV curing for chip-resistant finish', duration: 60, category: 'Manicure', targetAudience: 'Everyone', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop', isActive: true },
  { id: '3', name: 'French Manicure', description: 'Elegant classic French tips with perfect white and nude combination', duration: 50, category: 'Manicure', targetAudience: 'Everyone', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop', isActive: true },
  { id: '4', name: 'Spa Pedicure', description: 'Relaxing foot soak, exfoliation, massage, and polish', duration: 75, category: 'Pedicure', targetAudience: 'Everyone', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop', isActive: true },
  { id: '5', name: 'Nail Art Design', description: 'Custom artistic designs, from simple patterns to intricate artwork', duration: 90, category: 'Nail Art', targetAudience: 'Art Enthusiasts', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=300&fit=crop', isActive: true },
  { id: '6', name: 'Acrylic Extensions', description: 'Length and strength enhancement with sculpted acrylic nails', duration: 120, category: 'Extensions', targetAudience: 'Length Seekers', image: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=400&h=300&fit=crop', isActive: true },
];

// -----------------------
// 2) 后端 DTO 类型 + 适配器
// -----------------------
type BackendService = {
  id: number;
  name: string;
  description?: string | null;
  duration: number;                 // minutes
  target_audience?: string | null;
  image?: string | null;            // Image URL
  is_active: boolean;
  // 如果未来你加 category，这里再补上即可
  category?: string | null;
};

const mapFromBackend = (s: BackendService): Service => ({
  id: String(s.id),
  name: s.name,
  description: s.description ?? "",
  duration: s.duration ?? 60,
  category: s.category ?? "General",                 // 你后端暂时没有 category，就用 General
  targetAudience: s.target_audience ?? "Everyone",
  image: s.image ?? "",
  isActive: s.is_active ?? true,
});




// -----------------------
// 3) 组件
// -----------------------
export function ServicesTable() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 用 React Query 获取后端数据，并在 select 阶段完成映射
  const { data: mappedFromApi, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getAll(), // 返回的是 AxiosResponse
    select: (res) => {
      const data = res.data as any;
      const list: BackendService[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      return list.map(mapFromBackend);
    },

    retry: false,
  });

  // 有后端数据就用后端；出错/没有就用 mock
  const allServices: Service[] = (isError || !mappedFromApi?.length) ? mockServices : mappedFromApi;


  // const categories: string[] = ['all', ...Array.from(new Set(allServices.map(s => s.category)))];
  const CATEGORY_ORDER = [
  'all',
  'Manicure',
  'Pedicure',
  'Nail Art',
  'Waxing',
  'Other',
];

const categories = [
  'all',
  ...Array.from(new Set(allServices.map(s => s.category))),
].sort((a, b) => {
  const ia = CATEGORY_ORDER.indexOf(a);
  const ib = CATEGORY_ORDER.indexOf(b);

  // 不在表里的放最后
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
});

  const filteredServices = selectedCategory === 'all'
    ? allServices
    : allServices.filter((s) => s.category === selectedCategory);

  if (isLoading && !mappedFromApi?.length) {
    return (
      <div className="section-padding bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading services...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From classic elegance to bold artistic expression, discover the perfect service 
            to enhance your natural beauty.
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
          <TabsList
            className="
              grid
              w-full
              gap-2
              grid-cols-[repeat(auto-fit,minmax(120px,1fr))]
              mb-8
            "
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} />
        </Tabs>


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <Card key={service.id} className="card-elegant group overflow-hidden">
              <div className="aspect-video overflow-hidden rounded-t-2xl">
                <img
                  src={service.image || '/placeholder.svg'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-xl font-semibold text-card-foreground">
                    {service.name}
                  </h3>
                  <Badge variant="secondary" className="ml-2">
                    {service.category}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {service.targetAudience}
                  </div>
                </div>
                <Link to="/book" state={{ preselectedService: service }}>
                  <Button className="w-full btn-hero">Book This Service</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/book">
            <Button size="lg" className="btn-hero">Book Multiple Services</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
