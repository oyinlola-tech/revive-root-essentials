import { MessageCircle } from 'lucide-react';

const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.trim();
const rawWhatsappMessage = (import.meta.env.VITE_WHATSAPP_MESSAGE as string | undefined)?.trim();

export function WhatsAppFloat() {
  if (!whatsappNumber) return null;

  const whatsappLink = rawWhatsappMessage
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rawWhatsappMessage)}`
    : `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
