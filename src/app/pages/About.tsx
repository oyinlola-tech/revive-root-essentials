export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Behind Revive Roots Essential's Calm, Confident Glow
              </h1>
              <p className="text-lg opacity-70 mb-6">
                We believe in the power of nature to transform your beauty routine.
                Our journey began with a simple mission: to create effective,
                sustainable products that bring out your natural radiance.
              </p>
              <p className="text-lg opacity-70">
                Every product we create is crafted with care, using only the finest
                natural ingredients, backed by science, and tested for your peace
                of mind.
              </p>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1602188521046-bd078a8924aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhlYWx0aHklMjBoYWlyfGVufDF8fHx8MTc3MjM2NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="About Revive Roots Essential"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              From Irritated Skin to Calm Radiance
            </h2>
            <div className="space-y-6 text-lg opacity-70">
              <p>
                Revive Roots Essential was born from a personal journey of
                struggling with sensitive skin and damaged hair. Our founder,
                Sarah Mitchell, spent years searching for products that were both
                effective and gentle, only to be disappointed time and again.
              </p>
              <p>
                Determined to find a solution, she partnered with leading
                biochemists and natural ingredient experts to create a line of
                products that truly work. Today, Revive Roots Essential stands as
                a testament to the power of combining nature's wisdom with modern
                science.
              </p>
              <p>
                We're proud to serve thousands of customers who have discovered
                their natural beauty through our products. Our commitment to
                quality, sustainability, and efficacy remains unwavering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Milestones on Our Skin Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1760038548850-bfc356d88b12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY2FyZSUyMHByb2R1Y3RzJTIwYm90dGxlfGVufDF8fHx8MTc3MjM2NTI2NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Natural Ingredients"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">100% Natural</h3>
                <p>Sourced from sustainable farms around the world</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1768235146463-328c98e7234d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwY3JlYW18ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Lab Testing"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Scientifically Proven</h3>
                <p>Rigorously tested for safety and efficacy</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1764599955087-7095c3540510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBqYXJ8ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Sustainable Packaging"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Eco-Conscious</h3>
                <p>Recyclable packaging and carbon-neutral shipping</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1765607476376-9574ea76b2ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG93aW5nJTIwc2tpbiUyMGJlYXV0eXxlbnwxfHx8fDE3NzIzNjUyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Customer Care"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Customer First</h3>
                <p>Dedicated support for your beauty journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's Talk Skin & Revive Roots
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Have questions about our products or want to learn more about
              natural beauty? We'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:bg-primary-foreground/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
