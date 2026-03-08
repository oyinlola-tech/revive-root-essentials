import { MessageCircleMore } from "lucide-react";

const DEFAULT_WHATSAPP_NUMBER = "15551234567";
const DEFAULT_WHATSAPP_MESSAGE = "Hello Revive Roots Essentials, I need support.";

const normalizePhoneNumber = (value?: string) => String(value || "").replace(/[^\d]/g, "");

export function WhatsAppFloatingButton() {
  const phoneNumber = normalizePhoneNumber(import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER);
  const message = import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_WHATSAPP_MESSAGE;

  if (!phoneNumber) {
    return null;
  }

  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-4 z-[70] inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] md:bottom-6 md:right-6"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16">
        <MessageCircleMore className="h-5 w-5" />
      </span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
