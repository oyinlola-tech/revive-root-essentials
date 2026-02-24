import { SEO } from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen page-section">
      <SEO
        title="About Revive Roots Essentials"
        description="Learn about our mission, ingredients philosophy, and commitment to clean skincare."
        canonicalPath="/about"
      />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl mb-6">Rooted in Nature, Designed for Skin Health</h1>
          <p className="text-lg text-muted-foreground leading-8">
            Revive Roots Essentials creates clean skincare with practical formulas, transparent ingredients,
            and routines that support long-term skin resilience. We focus on products that are gentle,
            effective, and consistent enough for daily use.
          </p>
        </div>
      </div>
    </div>
  );
}

