import { salon } from '@/lib/salon';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowRight } from 'lucide-react';

export function Contact() {
  return <section className="section-padding bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center rounded-3xl border bg-card p-8 md:p-12">
        <div><p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Make time for you</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-5">Your next little<br />moment of care.</h2>
          <p className="text-muted-foreground leading-relaxed">Explore our services and book your visit online. You can include preferences or special requests with your appointment.</p>
        </div>
        <div className="space-y-6">
          <CalendarDays className="w-10 h-10 text-primary" aria-hidden="true" />
          <h3 className="font-serif text-2xl">Plan your visit</h3>
          <p className="text-muted-foreground">Choose your services, select a time and leave your contact details.</p>
          <Button asChild className="btn-hero"><Link to="/book">Book an appointment <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
          <address className="not-italic space-y-3 text-sm">
            <a href={salon.phoneHref} className="block font-medium text-primary underline underline-offset-4">{salon.phone}</a>
            <a href={salon.mapsHref} target="_blank" rel="noopener noreferrer" className="block underline underline-offset-4">{salon.address} ↗</a>
            <p className="text-muted-foreground">For opening hours or help with your visit, please call us.</p>
          </address>
        </div>
      </div>
    </div>
  </section>;
}
