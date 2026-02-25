export const formatMoney = (amount: number, currency = 'NGN') => {
  const normalized = String(currency || 'NGN').toUpperCase();
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalized,
      currencyDisplay: 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (error) {
    return `${normalized} ${safeAmount.toFixed(2)}`;
  }
};
