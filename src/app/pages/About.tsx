import { SEO } from '../components/SEO';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { sectionImages } from '../utils/imagePool';
import { Card, CardContent } from '../components/ui/card';
import { BadgeCheck, HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen page-section">
      <SEO
        title="About Revive Roots Essentials"
        description="Learn about our mission, ingredients philosophy, and commitment to clean skincare."
        canonicalPath="/about"
      />
      <section className="bg-[#fffaf6] py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <h1 className="text-5xl mb-6">Rooted in Nature, Designed for Skin Health</h1>
              <p className="text-lg text-muted-foreground leading-8">
                Revive Roots Essentials creates clean skincare with practical formulas, transparent ingredients,
                and routines that support long-term skin resilience. We focus on products that are gentle,
                effective, and consistent enough for daily use.
              </p>
            </div>
            <Card className="overflow-hidden border-[#eadfd6] bg-white/85 shadow-sm lg:max-w-sm">
              <div className="aspect-[4/5]">
                <ImageWithFallback
                  src={sectionImages.aboutHero}
                  alt="Botanical skincare textures"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4 text-sm text-muted-foreground">
                We formulate with clarity and intention so your routine stays simple, consistent, and effective.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-[#eee3d8]">
              <CardContent className="p-5">
                <Leaf className="mb-3 h-5 w-5 text-[#7a5b48]" />
                <h2 className="mb-2 font-semibold">Ingredient Integrity</h2>
                <p className="text-sm text-muted-foreground">
                  We prioritize ingredient transparency and balanced formulations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[#eee3d8]">
              <CardContent className="p-5">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#7a5b48]" />
                <h2 className="mb-2 font-semibold">Skin Barrier Respect</h2>
                <p className="text-sm text-muted-foreground">
                  Products are designed to support comfort and reduce avoidable irritation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[#eee3d8]">
              <CardContent className="p-5">
                <BadgeCheck className="mb-3 h-5 w-5 text-[#7a5b48]" />
                <h2 className="mb-2 font-semibold">Consistent Quality</h2>
                <p className="text-sm text-muted-foreground">
                  We focus on stable product performance and practical routine fit.
                </p>
              </CardContent>
            </Card>
            <Card className="border-[#eee3d8]">
              <CardContent className="p-5">
                <HeartHandshake className="mb-3 h-5 w-5 text-[#7a5b48]" />
                <h2 className="mb-2 font-semibold">Customer Support</h2>
                <p className="text-sm text-muted-foreground">
                  We guide you based on your goals, budget, and current routine.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[#f6efe8] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#eadfd6] bg-white p-8">
            <h2 className="text-3xl mb-5 text-center">Our Formulation Philosophy</h2>
            <p className="text-muted-foreground mb-4 leading-8 text-center">
              We believe strong skincare starts with clear priorities: cleanse gently, treat with intent,
              hydrate deeply, and protect daily. Instead of overcomplicated routines, we build products
              that layer well and make progression easier to track.
            </p>
            <p className="text-muted-foreground leading-8 text-center">
              Every ingredient choice is made to balance performance and tolerance. Whether you are managing
              dryness, texture, dullness, or sensitivity, we help you move toward healthier skin over time
              with routines that are realistic enough to keep.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
