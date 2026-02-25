import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

const STORAGE_KEY = 'currencyOverride';

export const SUPPORTED_CURRENCIES = [
  'GBP',
  'CAD',
  'XAF',
  'COP',
  'EGP',
  'EUR',
  'GHS',
  'KES',
  'IRN',
  'NGN',
  'RWF',
  'SLL',
  'ZAR',
  'TZS',
  'UGX',
  'USD',
  'XOF',
  'ZMW',
];

interface CurrencyContextType {
  currencyOverride: string | null;
  supportedCurrencies: string[];
  setCurrencyOverride: (currency: string) => void;
  clearCurrencyOverride: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const readStoredCurrency = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const normalized = stored.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(normalized) ? normalized : null;
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyOverride, setCurrencyOverrideState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return readStoredCurrency();
  });

  const setCurrencyOverride = (currency: string) => {
    const normalized = String(currency || '').trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(normalized)) return;
    localStorage.setItem(STORAGE_KEY, normalized);
    setCurrencyOverrideState(normalized);
  };

  const clearCurrencyOverride = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrencyOverrideState(null);
  };

  const value = useMemo(
    () => ({
      currencyOverride,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      setCurrencyOverride,
      clearCurrencyOverride,
    }),
    [currencyOverride],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
