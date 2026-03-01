import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitContactMessage } from "../services/api";
import { SITE_IMAGES } from "../constants/siteImages";
import { useSeo } from "../hooks/useSeo";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  useSeo({
    title: "Contact Revive Roots Essential | Hair & Skin Support",
    description:
      "Contact Revive Roots Essential for product guidance, skincare and hair care support, and order help in Nigeria.",
    image: SITE_IMAGES.contactHairProduct,
    canonicalPath: "/contact",
    keywords: "contact hair care support, skincare support, Lagos Nigeria beauty store",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState("loading");

    try {
      await submitContactMessage(formData);
      setSubmitState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Let&apos;s Talk About Your Hair and Skin</h1>
              <p className="text-lg opacity-70 mb-8">
                Have questions about our products or need guidance on what to choose? Our support
                team is ready to help.
              </p>

              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={SITE_IMAGES.contactHairProduct}
                  alt="Contact Revive Roots Essential"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-muted/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Drop Us a Note</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => {
                      setFormData({ ...formData, name: event.target.value });
                      if (submitState !== "idle") setSubmitState("idle");
                    }}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => {
                      setFormData({ ...formData, email: event.target.value });
                      if (submitState !== "idle") setSubmitState("idle");
                    }}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(event) => {
                      setFormData({ ...formData, subject: event.target.value });
                      if (submitState !== "idle") setSubmitState("idle");
                    }}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(event) => {
                      setFormData({ ...formData, message: event.target.value });
                      if (submitState !== "idle") setSubmitState("idle");
                    }}
                    required
                    className="bg-background"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitState === "loading"}>
                  {submitState === "loading" ? "Sending..." : "Send Message"}
                </Button>
                {submitState === "success" && (
                  <p className="text-sm text-green-700">Thank you. Your message has been sent successfully.</p>
                )}
                {submitState === "error" && (
                  <p className="text-sm text-red-600">Unable to send your message right now. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Talk to Us Directly</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="opacity-70">
                12 Admiralty Way, Lekki Phase 1
                <br />
                Lagos, Nigeria
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="opacity-70">+234 803 000 0000</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="opacity-70">support@reviverootsessential.com</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Store</h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-6 border border-border rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Revive Roots Essentials - Lagos</h3>
              <p className="opacity-70 mb-1">12 Admiralty Way, Lekki Phase 1</p>
              <p className="opacity-70">Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Revive Roots Help Center</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-primary-foreground/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Are your products suitable for sensitive skin?</h3>
              <p className="opacity-90">
                Yes. Our formulas are designed to be gentle and are made with carefully selected
                ingredients. We still recommend patch testing first.
              </p>
            </div>
            <div className="bg-primary-foreground/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Can I use your products during pregnancy?</h3>
              <p className="opacity-90">
                Many customers do, but we recommend checking with your healthcare professional for
                products used during pregnancy and breastfeeding.
              </p>
            </div>
            <div className="bg-primary-foreground/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">How soon can I expect results?</h3>
              <p className="opacity-90">
                Most customers notice visible improvement within 2 to 4 weeks of consistent use,
                depending on product and skin or hair type.
              </p>
            </div>
            <div className="bg-primary-foreground/10 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Are your products cruelty-free?</h3>
              <p className="opacity-90">Yes. We do not test on animals.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
