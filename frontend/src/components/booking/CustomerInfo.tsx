import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useBookingStore } from "@/stores/bookingStore";
import { User, Phone, MessageCircle } from "lucide-react";

const customerInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

type CustomerInfoForm = z.infer<typeof customerInfoSchema>;

interface CustomerInfoProps {
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function CustomerInfo({ onNext, onPrev }: CustomerInfoProps) {
  const { customerInfo, setCustomerInfo } = useBookingStore();

  const form = useForm<CustomerInfoForm>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      name: customerInfo.name,
      phone: customerInfo.phone,
      notes: customerInfo.notes,
    },
    mode: "onChange",
  });

  const onSubmit = (data: CustomerInfoForm) => {
    setCustomerInfo({
      name: data.name,
      phone: data.phone,
      notes: data.notes ?? "",
    });
    onNext(); // ✅ 去 Review / Confirm 页面
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Your Information</h2>
        <p className="text-muted-foreground">Please provide your details so we can confirm your appointment</p>
      </div>

      <Card className="card-elegant max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>Full Name *</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Phone Number *</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span>Notes (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests, allergies, or preferences..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onPrev}>
                  Back to Date &amp; Time
                </Button>

                <Button type="submit" className="btn-hero" disabled={!form.formState.isValid}>
                  Review Booking
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
