import { SEO } from '../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Contact() {
  return (
    <div className="min-h-screen page-section">
      <SEO
        title="Contact Revive Roots Essentials"
        description="Reach our skincare support team for product guidance, order help, and general inquiries."
        canonicalPath="/contact"
      />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl mb-6 text-center">Contact Us</h1>
          <p className="text-lg text-muted-foreground text-center mb-10">
            We typically respond within one business day.
          </p>
          <Card className="border-0 shadow-lg bg-white/85 backdrop-blur">
            <CardHeader>
              <CardTitle>Support Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Email: support@reviverootsessentials.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>WhatsApp: +1 (555) 123-4567</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

