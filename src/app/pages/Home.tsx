import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { productAPI } from '../services/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowRight, CheckCircle2, Droplets, Leaf, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';
import { formatMoney } from '../utils/formatMoney';
import { sectionImages } from '../utils/imagePool';

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

const productSections = [
  {
    title: 'Skin Care Soaps',
    description: 'Gentle cleansing bars and washes that remove buildup without stripping moisture.',
    query: 'soap',
  },
  {
    title: 'Face & Body Creams',
    description: 'Nourishing creams for hydration support, texture smoothing, and comfort.',
    query: 'cream',
  },
  {
    title: 'Body Lotions',
    description: 'Lightweight moisture layers for daily softness and long-lasting skin balance.',
    query: 'lotion',
  },
  {
    title: 'Hair Creams',
    description: 'Conditioning formulas that help reduce dryness, breakage, and frizz.',
    query: 'hair cream',
  },
  {
    title: 'Hair Oils',
    description: 'Scalp and strand support with nutrient-rich oil blends for shine and strength.',
    query: 'hair oil',
  },
  {
    title: 'Treatment Serums',
    description: 'Targeted products for dullness, uneven tone, and rough skin texture.',
    query: 'serum',
  },
];

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
        title="Skin and Hair Care Essentials"
        description="Shop natural soaps, creams, lotions, and skin or hair care essentials crafted for healthy daily care."
        canonicalPath="/"
        keywords="skin care soap, hair cream, body lotion, natural skincare, hair care essentials"
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
      <section className="bg-[#f5f1ed]">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center rounded-full border border-[#d8c8bb] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a5b48]">
                Clean Beauty, Practical Results
              </p>
              <h1 className="text-5xl md:text-6xl mb-6">
                Revive Your Skin
                <br />
                and Hair,
                <br />
                Naturally
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Shop practical daily essentials including skin soaps, face and body creams, lotions,
                serums, hair creams, and oils designed to support hydration, strength, and healthy glow.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/shop">
                  <Button size="lg" className="group">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    Explore Our Philosophy
                  </Button>
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#e6d9cf] bg-white px-4 py-3 text-sm">
                  <p className="font-semibold">Botanical Support</p>
                  <p className="text-muted-foreground">Plant-forward blends with purposeful actives.</p>
                </div>
                <div className="rounded-lg border border-[#e6d9cf] bg-white px-4 py-3 text-sm">
                  <p className="font-semibold">Gentle Everyday Use</p>
                  <p className="text-muted-foreground">Designed to fit sensitive and balanced routines.</p>
                </div>
                <div className="rounded-lg border border-[#e6d9cf] bg-white px-4 py-3 text-sm">
                  <p className="font-semibold">Visible Consistency</p>
                  <p className="text-muted-foreground">Simple systems for long-term skin health.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 lg:pt-1">
              <Card className="overflow-hidden border border-[#e6d9cf] bg-white/80 shadow-sm lg:max-w-sm">
                <div className="aspect-[5/4] bg-white">
                  <ImageWithFallback
                    src={sectionImages.homeHero}
                    alt="Natural skincare essentials"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Morning and evening staples curated to help you keep routines simple and results measurable.
                  </p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4 lg:max-w-sm">
                <Card className="border-[#e6d9cf] bg-white/90">
                  <CardContent className="p-4">
                    <Leaf className="mb-2 h-5 w-5 text-[#7a5b48]" />
                    <p className="text-sm font-medium">Naturally inspired blends</p>
                  </CardContent>
                </Card>
                <Card className="border-[#e6d9cf] bg-white/90">
                  <CardContent className="p-4">
                    <Sparkles className="mb-2 h-5 w-5 text-[#7a5b48]" />
                    <p className="text-sm font-medium">Texture and glow-focused care</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[#eee2d8]">
              <CardContent className="flex gap-3 p-5">
                <Droplets className="mt-1 h-5 w-5 text-[#7a5b48]" />
                <div>
                  <h3 className="mb-1 font-semibold">Hydration First</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore softness and barrier comfort before layering stronger actives.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#eee2d8]">
              <CardContent className="flex gap-3 p-5">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#7a5b48]" />
                <div>
                  <h3 className="mb-1 font-semibold">Routine Clarity</h3>
                  <p className="text-sm text-muted-foreground">
                    We remove guesswork with focused products and clear usage directions.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#eee2d8]">
              <CardContent className="flex gap-3 p-5">
                <Sparkles className="mt-1 h-5 w-5 text-[#7a5b48]" />
                <div>
                  <h3 className="mb-1 font-semibold">Realistic Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Better skin is built through consistency, not overnight promises.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#fcf8f4]">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl mb-3">Shop by Product Type</h2>
            <p className="text-muted-foreground">
              Start from the exact product category you need for skin or hair care.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productSections.map((section) => (
              <Link key={section.title} to={`/shop?search=${encodeURIComponent(section.query)}`}>
                <Card className="h-full border-[#eadfd6] transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-lg font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    <p className="mt-3 text-sm font-medium text-[#7a5b48]">Explore products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Featured Products</h2>
            <p className="text-muted-foreground">
              Handpicked skin and hair products selected from our active best-sellers.
            </p>
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
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">
                Behind Revive Roots'<br />Calm, Confident Glow
              </h2>
              <p className="text-muted-foreground mb-6">
                We believe in the power of nature to transform your skin. Our products are crafted with
                carefully selected natural ingredients that work in harmony with your skin's natural processes.
                From cleansers to treatment serums, every product is designed to support clarity, comfort,
                and long-term resilience.
              </p>
              <Link to="/about">
                <Button variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="aspect-[4/5] w-full max-w-sm bg-white rounded-lg overflow-hidden border border-[#e6d9cf] shadow-sm">
              <ImageWithFallback
                src={sectionImages.homeAbout}
                alt="Natural skincare ingredients"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Routine Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#eee2d8] bg-[#faf6f2] p-8">
            <h2 className="text-3xl md:text-4xl mb-5 text-center">A Ritual You Can Keep</h2>
            <p className="text-muted-foreground mb-4 text-center">
              Effective skincare should be sustainable. We focus on routines you can repeat daily
              without irritation, confusion, or unnecessary complexity.
            </p>
            <p className="text-muted-foreground mb-7 text-center">
              Begin with cleansing, follow with treatment based on your skin goals, and finish with
              moisture protection. This consistent structure helps you evaluate what works and reduce
              product overload.
            </p>
            <div className="text-center">
              <Link to="/contact">
                <Button variant="outline">Get Product Guidance</Button>
              </Link>
            </div>
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
