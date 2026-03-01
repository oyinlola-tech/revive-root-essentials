import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { getFeaturedProducts as getFallbackFeaturedProducts } from "../data/products";
import { ArrowRight, FlaskConical, Leaf, Recycle } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckoutModal } from "../components/CheckoutModal";
import { Product } from "../data/products";
import { getFeaturedProducts, subscribeToNewsletter } from "../services/api";

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getFallbackFeaturedProducts());
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let ignore = false;

    const loadFeaturedProducts = async () => {
      try {
        const apiProducts = await getFeaturedProducts();
        if (!ignore && apiProducts.length > 0) {
          setFeaturedProducts(apiProducts);
        }
      } catch {
        if (!ignore) {
          setFeaturedProducts(getFallbackFeaturedProducts());
        }
      }
    };

    loadFeaturedProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    setCheckoutOpen(true);
  };

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterState("loading");
    try {
      await subscribeToNewsletter(newsletterEmail);
      setNewsletterState("success");
      setNewsletterEmail("");
    } catch {
      setNewsletterState("error");
    }
  };

  return (
    <div>
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1602188521046-bd078a8924aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhlYWx0aHklMjBoYWlyfGVufDF8fHx8MTc3MjM2NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Revive Your Natural Beauty</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Discover our collection of natural hair and skincare products designed to nourish,
              restore, and enhance your natural radiance.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Revive Roots Essential</h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              We are committed to bringing you the finest natural products for your hair and skin
              care needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Natural</h3>
              <p className="opacity-70">All our products are made with carefully selected natural ingredients.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scientifically Proven</h3>
              <p className="opacity-70">Backed by research and tested for efficacy and safety.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="opacity-70">Sustainable practices from sourcing to packaging.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-lg opacity-70">Our most loved hair and skincare essentials</p>
            </div>
            <Link to="/shop">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop By Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/shop?category=hair" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1602188521046-bd078a8924aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhlYWx0aHklMjBoYWlyfGVufDF8fHx8MTc3MjM2NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Hair Care"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/20" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
                <h3 className="text-3xl font-bold mb-2">Hair Care</h3>
                <p className="mb-4 opacity-90">Nourish and revitalize your hair</p>
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Shop Hair Care
                </Button>
              </div>
            </Link>
            <Link to="/shop?category=skincare" className="group relative overflow-hidden rounded-lg aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1765607476376-9574ea76b2ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG93aW5nJTIwc2tpbiUyMGJlYXV0eXxlbnwxfHx8fDE3NzIzNjUyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Skin Care"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/20" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
                <h3 className="text-3xl font-bold mb-2">Skin Care</h3>
                <p className="mb-4 opacity-90">Reveal your natural glow</p>
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Shop Skin Care
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Revive Roots Family</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive tips, product launches, and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(event) => {
                  setNewsletterEmail(event.target.value);
                  if (newsletterState !== "idle") setNewsletterState("idle");
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                required
              />
              <Button
                type="submit"
                disabled={newsletterState === "loading"}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {newsletterState === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            {newsletterState === "success" && (
              <p className="text-sm mt-4 opacity-90">You are now subscribed to our newsletter.</p>
            )}
            {newsletterState === "error" && (
              <p className="text-sm mt-4 text-red-200">Unable to subscribe right now. Please try again.</p>
            )}
          </div>
        </div>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onCheckout={() => {
          alert("Order placed successfully!");
          setCheckoutOpen(false);
          setCartItems([]);
        }}
      />
    </div>
  );
}
