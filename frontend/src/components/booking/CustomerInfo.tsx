import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBookingStore } from '@/stores/bookingStore';
import { User, Mail, Phone, MessageCircle } from 'lucide-react';

const customerInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
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
      email: customerInfo.email,
      phone: customerInfo.phone,
      notes: customerInfo.notes,
    },
  });

  const onSubmit = (data: CustomerInfoForm) => {
    setCustomerInfo(data);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Your Information
        </h2>
        <p className="text-muted-foreground">
          Please provide your contact details so we can confirm your appointment
        </p>
      </div>

      <Card className="card-elegant max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
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
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
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
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>Email Address *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <span>Special Requests or Notes (Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests, allergies, or preferences we should know about..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Privacy Notice */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Privacy Notice:</strong> Your information is securely stored and used only for 
                  appointment management. We'll send you confirmation and reminder messages. 
                  You can update your preferences anytime.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onPrev}>
                  Back to Date & Time
                </Button>
                
                <Button type="submit" className="btn-hero">
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