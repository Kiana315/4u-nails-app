import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <Sparkles className="w-6 h-6 text-primary-foreground/70" />
      </div>
      <div className="absolute top-40 right-20 animate-pulse">
        <Star className="w-8 h-8 text-primary-foreground/50" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
        <Sparkles className="w-5 h-5 text-primary-foreground/60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="animate-fade-in">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 leading-tight">
            Beautiful Nails,
            <br />
            <span className="text-primary-foreground/90">Beautiful You</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience luxury nail care with our expert technicians. From classic manicures to artistic nail designs, we make your beauty dreams come true.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-full shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                Book Your Appointment
              </Button>
            </Link>
            
            <Link
              to="/services"
              className="text-primary-foreground hover:text-primary-foreground/80 font-medium underline-offset-4 hover:underline transition-all duration-300"
            >
              Explore Our Services
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">500+ Happy Clients</span>
            </div>
            <div className="w-1 h-1 bg-primary-foreground/50 rounded-full hidden sm:block"></div>
            <span className="text-sm font-medium">Expert Certified Technicians</span>
            <div className="w-1 h-1 bg-primary-foreground/50 rounded-full hidden sm:block"></div>
            <span className="text-sm font-medium">Premium Quality Products</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}