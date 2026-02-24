import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { newsletterAPI } from '../services/api';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-[#342721] via-[#3f2f29] to-[#2e231e] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg mb-4">About Us</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/about" className="hover:opacity-100">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:opacity-100">
                  Contact Info
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:opacity-100">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/shop" className="hover:opacity-100">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:opacity-100">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:opacity-100">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-4">Contact Info</h3>
            <div className="space-y-2 text-sm opacity-80">
              <p>Email: info@reviveroots.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Main St, City, State 12345</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg mb-4">Join the Newsletter</h3>
            <p className="text-sm opacity-80 mb-4">
              Get exclusive updates, skincare tips, and offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button 
                type="submit" 
                disabled={isSubscribing}
                className="bg-white text-[#3a2e28] hover:bg-white/90"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-60">© 2026 Revive Roots Essentials. All rights reserved.</p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="opacity-60 hover:opacity-100">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-60 hover:opacity-100">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-60 hover:opacity-100">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-60 hover:opacity-100">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
