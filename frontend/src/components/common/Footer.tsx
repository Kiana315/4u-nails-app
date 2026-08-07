import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Heart } from 'lucide-react';

const socialLinks = [
  { icon: Facebook, href: '', label: 'Facebook' },
  { icon: Instagram, href: '', label: 'Instagram' },
  { icon: Twitter, href: '', label: 'Twitter' },
  { icon: Youtube, href: '', label: 'YouTube' },
];

const quickLinks = [
  { label: 'Services', href: '/services' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'Book Now', href: '/book' },
  { label: 'Admin Login', href: '/login'},
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cancellation Policy', href: '/cancellation' },
  
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
              <span className="font-serif text-2xl font-semibold">4U Nails</span>
            </div>
            
            <p className="text-background/80 leading-relaxed mb-6 max-w-md">
              Your premier destination for luxury nail care. We combine artistic expertise 
              with the highest standards of hygiene and customer service to create beautiful, 
              lasting results.
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-background/80 hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-background/80 hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-3 text-background/80">
              <p>123 Beauty Street</p>
              <p>Downtown Beauty District</p>
              <p className="mt-4">
                <strong className="text-background">Phone:</strong><br />
                (555) 123-4567
              </p>
              <p>
                <strong className="text-background">Email:</strong><br />
                hello@bellanails.com
              </p>
              <p>
                <strong className="text-background">Hours:</strong><br />
                Mon-Sat: 9AM-7PM<br />
                Sun: 10AM-6PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-background/80 mb-4 md:mb-0">
              <span>© 2024 Bella Nails. Made with</span>
              <Heart className="w-4 h-4 text-primary fill-current" />
              <span>for beautiful nails.</span>
            </div>
            
            <div className="flex space-x-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-background/80 hover:text-primary transition-colors duration-300 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}