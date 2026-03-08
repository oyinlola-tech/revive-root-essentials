import { Link } from "react-router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { BRAND_LOGO_SRC, BRAND_NAME } from "../constants/branding";
import { useState } from "react";
import { subscribeToNewsletter } from "../services/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setNewsletterState("loading");
    try {
      await subscribeToNewsletter(email);
      setNewsletterState("success");
      setEmail("");
    } catch {
      setNewsletterState("error");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 bg-card p-1 shadow-sm">
                <img
                  src={BRAND_LOGO_SRC}
                  alt={BRAND_NAME}
                  className="h-full w-full rounded-full object-contain"
                />
              </span>
              <span className="font-bold text-base">
                Revive Roots
                <br />
                Essential
              </span>
            </div>
            <p className="text-sm opacity-90">
              Natural hair and skincare solutions for healthy, radiant beauty.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:opacity-70 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:opacity-70 transition-opacity">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:opacity-70 transition-opacity">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:opacity-70 transition-opacity">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-90">support@reviverootsessential.com</li>
              <li className="opacity-90">+234 803 000 0000</li>
              <li className="opacity-90">
                12 Admiralty Way, Lekki Phase 1
                <br />
                Lagos, Nigeria
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Join the Revive Roots Family</h3>
            <p className="text-sm opacity-90 mb-4">Get exclusive updates, skincare tips, and special offers.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (newsletterState !== "idle") setNewsletterState("idle");
                }}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                required
              />
              <Button
                type="submit"
                disabled={newsletterState === "loading"}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {newsletterState === "loading" ? "..." : "Subscribe"}
              </Button>
            </form>
            {newsletterState === "success" && <p className="text-xs mt-2 opacity-90">Subscribed successfully.</p>}
            {newsletterState === "error" && (
              <p className="text-xs mt-2 text-red-200">Subscription failed. Please try again.</p>
            )}
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-sm text-center opacity-80">
          <p>
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
