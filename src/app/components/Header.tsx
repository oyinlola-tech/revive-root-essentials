import { Link } from "react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { BRAND_LOGO_SRC, BRAND_NAME } from "../constants/branding";
import { useCommerce } from "../contexts/CommerceContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useCommerce();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-white p-1 shadow-sm">
              <img
                src={BRAND_LOGO_SRC}
                alt={BRAND_NAME}
                className="h-full w-full rounded-full object-contain"
              />
            </span>
            <span className="font-bold text-sm leading-tight sm:text-lg">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:opacity-70 transition-opacity">
              Home
            </Link>
            <Link to="/shop" className="hover:opacity-70 transition-opacity">
              Shop
            </Link>
            <Link to="/about" className="hover:opacity-70 transition-opacity">
              About
            </Link>
            <Link to="/contact" className="hover:opacity-70 transition-opacity">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="p-2 relative" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="p-2">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="p-2 relative" aria-label="Shopping bag">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4 border-t border-primary/10 pt-4">
            <Link to="/" className="hover:opacity-70 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link
              to="/shop"
              className="hover:opacity-70 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="hover:opacity-70 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="hover:opacity-70 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
