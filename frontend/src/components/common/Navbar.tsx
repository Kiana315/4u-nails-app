import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const links = [
  { label: 'Services', to: '/services' },
  { label: 'Why Choose Us', to: '/#why-us' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <nav aria-label="Main navigation" className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-primary shrink-0">
          <span aria-hidden="true" className="w-8 h-8 gradient-hero rounded-full" />4U Nails
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          {links.map(link => <Link key={link.to} to={link.to}
            aria-current={location.pathname + location.hash === link.to ? 'page' : undefined}
            className="font-medium hover:text-primary transition-colors aria-[current=page]:text-primary">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-full"><Link to="/book">Book Now</Link></Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
            <SheetContent className="w-72">
              <SheetTitle className="font-serif text-2xl">4U Nails</SheetTitle>
              <SheetDescription>Explore our salon and plan your visit.</SheetDescription>
              <div className="flex flex-col gap-6 mt-8">
                {links.map(link => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary">{link.label}</Link>)}
                <Button asChild><Link to="/book" onClick={() => setOpen(false)}>Book an appointment</Link></Button>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Staff login</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
