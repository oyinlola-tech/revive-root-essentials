import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { productAPI } from '../services/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { formatMoney } from '../utils/formatMoney';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
  image: string;
  category: string;
}

const mapProduct = (product: any): Product => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: Number(product.price),
  currency: product.currency || 'NGN',
  image: product.imageUrl || product.image || '',
  category: product.Category?.name || product.category || 'Uncategorized',
});

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      // API Call: GET /products/featured
      const products = await productAPI.getFeaturedProducts();
      setFeaturedProducts((products || []).map(mapProduct));
    } catch (error) {
      console.error('Failed to load products:', error);
      setFeaturedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-section">
      <SEO
        title="Natural Skincare Essentials"
        description="Shop clean, natural skincare products crafted for calm, healthy, radiant skin."
        canonicalPath="/"
        keywords="natural skincare, clean beauty, face serum, gentle cleanser, revive roots essentials"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Revive Roots Essentials',
          url: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, ''),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${(import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')}/shop?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      {/* Hero Section */}
      <section className="relative h-[600px] bg-[#f5f1ed] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl mb-6">
              Revive Your Skin,<br />Naturally
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our curated collection of natural skincare essentials that bring out your skin's natural radiance.
            </p>
            <Link to="/shop">
              <Button size="lg" className="group">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked essentials for your skincare routine</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.slug || product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                      <h3 className="font-medium mb-2">{product.name}</h3>
                      <p className="font-semibold">{formatMoney(product.price, product.currency)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#f5f1ed]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">
                Behind Revive Roots'<br />Calm, Confident Glow
              </h2>
              <p className="text-muted-foreground mb-6">
                We believe in the power of nature to transform your skin. Our products are crafted with carefully selected natural ingredients that work in harmony with your skin's natural processes.
              </p>
              <Link to="/about">
                <Button variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="aspect-square bg-white rounded-lg" />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to get exclusive skincare tips, new product launches, and special offers.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-md"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
