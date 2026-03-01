export const SUPPORTED_PAYMENT_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "GHS",
  "KES",
  "ZAR",
  "UGX",
  "TZS",
  "XOF",
  "XAF",
  "ZMW",
  "RWF",
  "SLL",
  "EGP",
  "COP",
  "IRN",
] as const;

export type SupportedPaymentCurrency = (typeof SUPPORTED_PAYMENT_CURRENCIES)[number];
