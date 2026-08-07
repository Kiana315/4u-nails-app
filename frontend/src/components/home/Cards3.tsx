import { Card, CardContent } from '@/components/ui/card';
import { Palette, Scissors, Sparkles } from 'lucide-react';

const cards = [
  {
    icon: Palette,
    title: 'Artistic Designs',
    description: 'Express yourself with our custom nail art, from elegant French tips to bold creative patterns that reflect your unique style.',
  },
  {
    icon: Scissors,
    title: 'Expert Care',
    description: 'Our certified technicians provide meticulous attention to nail health, using premium products for long-lasting, beautiful results.',
  },
  {
    icon: Sparkles,
    title: 'Luxury Experience',
    description: 'Relax in our serene spa environment while enjoying personalized service and the highest standards of cleanliness and comfort.',
  },
];

export function Cards3() {
  return (
    <section className="section-padding bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Why Choose 4U Nails?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect blend of artistry, expertise, and luxury that makes every visit exceptional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Card 
              key={index} 
              className="card-elegant group hover:shadow-hover hover:-translate-y-2 transition-all duration-300 border-0 bg-card/60 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl font-semibold text-card-foreground mb-4">
                  {card.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}