import { Card, CardContent } from '@/components/ui/card';
import { Award, Clock, Heart, Shield, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Award-Winning Service',
    description: 'Recognized as the Best Nail Salon in the city for three consecutive years.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Online booking available 24/7 with same-day appointments often available.',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Every client receives customized treatment based on their unique needs.',
  },
  {
    icon: Shield,
    title: 'Health & Safety First',
    description: 'Hospital-grade sterilization and the highest hygiene standards.',
  },
  {
    icon: Users,
    title: 'Expert Technicians',
    description: 'Licensed professionals with years of experience and ongoing training.',
  },
  {
    icon: Zap,
    title: 'Latest Techniques',
    description: 'We stay current with the newest trends and innovative nail care methods.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            The 4U Nails Difference
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience unmatched quality and service that has made us the premier destination 
            for nail care in our community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start space-x-4 p-6 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 p-8 rounded-2xl bg-gradient-card shadow-elegant">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="w-1 h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">5★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="w-1 h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">3+</div>
              <div className="text-sm text-muted-foreground">Years Excellence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}