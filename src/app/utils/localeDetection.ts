/**
 * Locale detection and currency selection utilities
 * Handles automatic currency selection based on user country
 */

import { COUNTRY_TO_CURRENCY, SUPPORTED_COUNTRIES } from '../constants/countries';
import { SUPPORTED_PAYMENT_CURRENCIES } from '../constants/currencies';

/**
 * Get user's country from browser locale or IP geolocation
 * Falls back to localStorage if previously detected
 */
export const detectUserCountry = (): string => {
  // 1. Check localStorage for previously selected country
  const storedCountry = localStorage.getItem('user_country');
  if (storedCountry && SUPPORTED_COUNTRIES.includes(storedCountry as any)) {
    return storedCountry;
  }

  // 2. Try browser language/locale detection
  const browserLocale = getBrowserLocale();
  const localeCountry = localeToCountry(browserLocale);
  if (localeCountry && SUPPORTED_COUNTRIES.includes(localeCountry as any)) {
    localStorage.setItem('user_country', localeCountry);
    return localeCountry;
  }

  // 3. Default to Nigeria
  return 'Nigeria';
};

/**
 * Extract country from browser locale (e.g., "en-NG" -> "Nigeria")
 */
const localeToCountry = (locale: string): string | null => {
  if (!locale || locale.length < 2) return null;

  // Parse locale string (format: language-COUNTRY)
  const parts = locale.split('-');
  if (parts.length < 2) return null;

  const countryCode = parts[1].toUpperCase();

  // Map country codes to full country names
  const countryCodeMap: Record<string, string> = {
    'NG': 'Nigeria',
    'GH': 'Ghana',
    'KE': 'Kenya',
    'ZA': 'South Africa',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'ET': 'Ethiopia',
    'CM': 'Cameroon',
    'SN': 'Senegal',
    'ZW': 'Zimbabwe',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico',
    'BR': 'Brazil',
    'CO': 'Colombia',
    'AR': 'Argentina',
    'JM': 'Jamaica',
    'TT': 'Trinidad and Tobago',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'PL': 'Poland',
    'IE': 'Ireland',
    'IN': 'India',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'JP': 'Japan',
    'KR': 'South Korea',
    'HK': 'Hong Kong',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'QA': 'Qatar',
    'KW': 'Kuwait',
    'BH': 'Bahrain',
    'OM': 'Oman',
    'IL': 'Israel',
    'LB': 'Lebanon',
  };

  return countryCodeMap[countryCode] || null;
};

/**
 * Get browser's locale/language preference
 */
const getBrowserLocale = (): string => {
  if (typeof navigator === 'undefined') return '';
  return navigator.language || (navigator as any).userLanguage || '';
};

/**
 * Get currency for a given country
 * Returns default currency if country not found
 */
export const getCurrencyForCountry = (country: string): string => {
  return COUNTRY_TO_CURRENCY[country] || 'USD';
};

/**
 * Set user's preferred country (and auto-select currency)
 */
export const setUserCountry = (country: string): void => {
  if (SUPPORTED_COUNTRIES.includes(country as any)) {
    localStorage.setItem('user_country', country);
    const currency = getCurrencyForCountry(country);
    setUserCurrency(currency);
  }
};

/**
 * Get user's preferred currency
 */
export const getUserCurrency = (): string => {
  const stored = localStorage.getItem('user_currency');
  if (stored && SUPPORTED_PAYMENT_CURRENCIES.includes(stored as any)) {
    return stored;
  }

  // Auto-detect from country
  const country = detectUserCountry();
  const currency = getCurrencyForCountry(country);
  if (SUPPORTED_PAYMENT_CURRENCIES.includes(currency as any)) {
    return currency;
  }

  return 'USD'; // Global default
};

/**
 * Set user's preferred currency
 */
export const setUserCurrency = (currency: string): void => {
  if (SUPPORTED_PAYMENT_CURRENCIES.includes(currency as any)) {
    localStorage.setItem('user_currency', currency);
  }
};

/**
 * Get all info about user's locale (country, currency, language)
 */
export const getUserLocaleInfo = () => {
  const country = detectUserCountry();
  const currency = getUserCurrency();
  const language = getBrowserLocale();

  return {
    country,
    currency,
    language,
    supportedCountries: SUPPORTED_COUNTRIES,
    supportedCurrencies: SUPPORTED_PAYMENT_CURRENCIES,
  };
};

/**
 * Format price with proper currency symbol and locale formatting
 */
export const formatPriceForLocale = (
  amount: number,
  currency: string = getUserCurrency()
): string => {
  const currencySymbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: '$',
    GHS: '₵',
    KES: 'KSh',
    ZAR: 'R',
    UGX: 'USh',
    TZS: 'TSh',
    RWF: 'FRw',
    INR: '₹',
  };

  const symbol = currencySymbols[currency] || currency;

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch {
    // Fallback if currency is not recognized by Intl
    return `${symbol}${amount.toLocaleString()}`;
  }
};

/**
 * Initialize locale detection on app startup
 */
export const initializeLocale = (): void => {
  if (typeof window !== 'undefined') {
    detectUserCountry();
    getUserCurrency();
  }
};
