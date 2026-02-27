import { FormEvent, useState } from 'react';
import { SEO } from '../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { contactAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { sectionImages } from '../utils/imagePool';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill out all fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await contactAPI.submitContactForm(form);
      toast.success('Your message has been sent. We will get back to you shortly.');
      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      toast.error(error?.message || 'Unable to submit your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen page-section">
      <SEO
        title="Contact Revive Roots Essentials"
        description="Reach our skincare support team for product guidance, order help, and general inquiries."
        canonicalPath="/contact"
      />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl mb-6 text-center">Contact Us</h1>
          <p className="text-lg text-muted-foreground text-center mb-10">
            We typically respond within one business day. Reach us for order support, product guidance,
            routine questions, or wholesale discussions.
          </p>
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div className="rounded-2xl overflow-hidden border border-[#eadfd6] shadow-sm min-h-[220px] md:max-w-sm">
              <ImageWithFallback
                src={sectionImages.contactPanel}
                alt="Skincare consultation"
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="border-0 shadow-lg bg-white/85 backdrop-blur">
              <CardHeader>
                <CardTitle>Support Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>Email: support@reviverootsessentials.com (General support and order updates)</p>
                <p>Phone: +1 (555) 123-4567 (Mon-Fri, 9:00 AM - 5:00 PM)</p>
                <p>WhatsApp: +1 (555) 123-4567 (Quick product and routine help)</p>
                <p className="pt-2 text-sm">
                  For faster support, include your order number and the exact product names in your message.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="border-[#eadfd6]">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={form.subject}
                      onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                      placeholder="Please share details of your request..."
                      className="min-h-32"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Sending Message...' : 'Submit Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-[#eadfd6]">
              <CardHeader>
                <CardTitle>What We Can Help With</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>1. Product matching based on skin type, sensitivity, and current routine.</p>
                <p>2. Order support including tracking, delivery concerns, and replacement requests.</p>
                <p>3. Routine sequencing: what to use first, what to combine, and what to avoid.</p>
                <p>4. Business and partnership inquiries for retail and wholesale opportunities.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
