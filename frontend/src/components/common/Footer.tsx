import { salon } from '@/lib/salon';
import { Link } from 'react-router-dom';

export function Footer() {
  return <footer className="bg-foreground text-background">
    <div className="container mx-auto px-4">
      <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-3">
        <div><Link to="/" className="font-serif text-3xl font-semibold">4U Nails</Link>
          <p className="mt-4 max-w-sm text-background/75 leading-relaxed">A little time for yourself. Discover your next nail look and plan your visit with us.</p></div>
        <nav aria-label="Footer navigation"><h2 className="font-semibold mb-4">Explore</h2>
          <div className="flex flex-col items-start gap-3 text-background/80">
            <Link to="/services">Our services</Link><Link to="/#about">About the salon</Link><Link to="/#contact">Plan your visit</Link>
          </div></nav>
        <div><h2 className="font-semibold mb-4">Your next appointment</h2>
          <p className="text-background/75 mb-5">Choose your services and find a time that suits you.</p>
          <Link to="/book" className="inline-block rounded-full bg-background text-foreground px-6 py-3 font-medium">Book now →</Link></div>
      </div>
      <address className="not-italic flex flex-wrap gap-x-8 gap-y-3 pb-8 text-background/80">
        <a href={salon.phoneHref} className="underline underline-offset-4">{salon.phone}</a>
        <a href={salon.mapsHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{salon.address} ↗</a>
      </address>
      <div className="border-t border-background/20 py-6 flex flex-wrap gap-4 justify-between text-sm text-background/70">
        <p>© {new Date().getFullYear()} 4U Nails. All rights reserved.</p><Link to="/login">Staff login</Link>
      </div>
    </div>
  </footer>;
}
