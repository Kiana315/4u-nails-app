import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, Star, Users } from 'lucide-react';

export function About() {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop"
                alt="Bella Nails salon interior"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats */}
            <div className="absolute -top-6 -right-6 bg-card rounded-2xl p-6 shadow-elegant">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">3+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-elegant">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="animate-slide-up">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Your Beauty, Our Passion
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Founded with a vision to revolutionize nail care, Bella Nails has become 
              the premier destination for luxury nail services. Our commitment to excellence, 
              combined with a passion for artistic expression, creates an experience that 
              goes beyond traditional nail care.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 rounded-xl bg-gradient-card">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-foreground">Certified Excellence</div>
                <div className="text-sm text-muted-foreground">Award-winning service</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-card">
                <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-foreground">Personal Care</div>
                <div className="text-sm text-muted-foreground">Tailored to you</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-foreground">
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide exceptional nail care services in a luxurious, relaxing environment 
                while maintaining the highest standards of hygiene and professionalism. We believe 
                that beautiful nails are an expression of your unique personality and style.
              </p>
            </div>

            {/* Team highlights */}
            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="font-serif text-xl font-semibold text-foreground mb-4">
                Meet Our Expert Team
              </h4>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    M
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                    S
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                    A
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Licensed professionals with 5+ years experience
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}