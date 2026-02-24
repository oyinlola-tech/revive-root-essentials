import { SEO } from '../components/SEO';

const faqs = [
  {
    q: 'Why do I need to accept Terms and Conditions to register?',
    a: 'Terms acceptance is mandatory for account creation. It confirms your agreement with platform rules for orders, account security, communication preferences, and data handling.',
  },
  {
    q: 'Are marketing emails and newsletters required?',
    a: 'No. Marketing and newsletter consent is optional. You can create an account without opting in and still use core purchase/account features.',
  },
  {
    q: 'What is included in the weekly newsletter?',
    a: 'The newsletter includes a curated weekly update with the latest 15 products, each with image, price in Nigerian Naira, and direct product links.',
  },
  {
    q: 'How can I unsubscribe from newsletter emails?',
    a: 'Each newsletter includes a one-click unsubscribe link. You can also request communication preference changes through available account tools.',
  },
  {
    q: 'Can I delete my account whenever I want?',
    a: 'Yes. Account deletion is available from your authenticated dashboard. Once deleted, your access is revoked and data is handled per retention and compliance requirements.',
  },
  {
    q: 'Can a superadmin send newsletters before the scheduled weekly date?',
    a: 'Yes. Superadmin can manually trigger a newsletter campaign at any time from the dashboard.',
  },
  {
    q: 'Which currency is used in newsletter pricing?',
    a: 'Newsletter pricing is displayed in NGN (Naira) to keep communication aligned with local market expectations.',
  },
  {
    q: 'Do you guarantee all products are in stock when emailed?',
    a: 'Newsletter listings are generated from recent catalog data. Stock can still change quickly due to demand, so availability is confirmed on the product page at the time of purchase.',
  },
  {
    q: 'What should I do if I suspect unauthorized account access?',
    a: 'Immediately reset your password, verify recent order activity, and contact support. Login alert controls are in place to improve account security visibility.',
  },
  {
    q: 'How often is the newsletter sent automatically?',
    a: 'The campaign scheduler runs weekly based on configured UTC day/time settings in the backend environment.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen page-section">
      <SEO
        title="FAQ"
        description="Frequently asked questions about account registration, newsletter preferences, unsubscribe options, and account deletion."
        canonicalPath="/faq"
      />
      <div className="container mx-auto px-4 py-14">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-10 leading-8">
            This FAQ explains how account consent, newsletter campaigns, unsubscribe controls, and account deletion work in Revive Roots Essentials.
          </p>

          <div className="space-y-6">
            {faqs.map((item) => (
              <section key={item.q} className="border border-border rounded-lg p-5 bg-card">
                <h2 className="text-xl mb-2">{item.q}</h2>
                <p className="text-muted-foreground leading-8">{item.a}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
