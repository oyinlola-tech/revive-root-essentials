import { SEO } from '../components/SEO';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen page-section">
      <SEO
        title="Terms and Conditions"
        description="Detailed terms and conditions governing access to Revive Roots Essentials, account use, orders, newsletters, and data controls."
        canonicalPath="/terms-and-conditions"
      />
      <div className="container mx-auto px-4 py-14">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-4xl">Terms and Conditions</h1>
          <p className="text-sm text-muted-foreground">Effective date: February 24, 2026</p>
          <p className="text-muted-foreground leading-8">
            These Terms and Conditions govern your access to and use of Revive Roots Essentials, including our website,
            user account, product catalog, checkout services, newsletters, and communication channels. By creating an account,
            placing an order, subscribing to marketing communications, or using any part of our services, you agree to these terms.
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl">1. Eligibility and Account Responsibility</h2>
            <p className="text-muted-foreground leading-8">
              You must provide accurate and complete registration information and maintain the confidentiality of your login credentials.
              You are responsible for all actions performed through your account. If you suspect unauthorized access, you must update your
              password immediately and contact support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">2. Required Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-8">
              Account creation requires explicit acceptance of these Terms and Conditions. This consent is logged with timestamp metadata
              and used as part of our compliance records. Without terms acceptance, an account cannot be created.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">3. Optional Marketing and Newsletter Consent</h2>
            <p className="text-muted-foreground leading-8">
              Marketing and newsletter subscriptions are optional. You may consent during registration or later through available subscription controls.
              Weekly newsletter campaigns may include recently launched products, pricing in Nigerian Naira, product links, and editorial recommendations.
            </p>
            <p className="text-muted-foreground leading-8">
              You can unsubscribe at any time using unsubscribe links in email campaigns or by adjusting communication preferences where available.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">4. Orders, Pricing, and Currency</h2>
            <p className="text-muted-foreground leading-8">
              Product pricing, stock, and availability may change without prior notice. We take reasonable care to ensure pricing accuracy,
              but errors may occur. In cases of pricing or technical errors, we reserve the right to cancel or correct affected orders with notice.
            </p>
            <p className="text-muted-foreground leading-8">
              Campaign communications may display prices in NGN for local relevance. Final checkout totals, payment method rules, and settlement timing
              depend on the active payment configuration and confirmed transaction status.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">5. Product Information and Usage</h2>
            <p className="text-muted-foreground leading-8">
              Product descriptions, ingredients, and recommendations are provided for informational and cosmetic guidance purposes only and are not medical advice.
              Patch testing is recommended before full use. If irritation occurs, discontinue use and consult a qualified professional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">6. Account Suspension and Termination</h2>
            <p className="text-muted-foreground leading-8">
              We may suspend or terminate accounts involved in abuse, fraud, unlawful conduct, unauthorized access attempts, or material policy violations.
              You may request self-service account deletion through your profile access where available.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">7. Account Deletion and Data Handling</h2>
            <p className="text-muted-foreground leading-8">
              You may delete your account from your authenticated dashboard. Upon deletion, access to account features is removed and associated personal data
              is processed according to operational, legal, fraud-prevention, and accounting retention requirements. Certain transactional records may be retained
              where required by law or platform integrity controls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">8. Acceptable Use</h2>
            <p className="text-muted-foreground leading-8">
              You agree not to misuse the platform, bypass authentication, scrape protected data, upload malicious content, send spam, or interfere with service availability.
              We may enforce technical and legal protections against abuse.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">9. Intellectual Property</h2>
            <p className="text-muted-foreground leading-8">
              All brand assets, creative content, product copy, UI components, and platform logic are protected by applicable intellectual property laws.
              Unauthorized copying, redistribution, or commercial exploitation is prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-8">
              To the extent permitted by law, Revive Roots Essentials is not liable for indirect, incidental, special, consequential, or punitive damages arising from platform use,
              service interruption, third-party failures, or user-side configuration/security issues.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-8">
              We may update these terms from time to time. Material updates will be reflected on this page with a revised effective date.
              Continued platform use after updates means you accept the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">12. Contact</h2>
            <p className="text-muted-foreground leading-8">
              For legal, licensing, or policy questions, use the official support channels listed in this project documentation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
