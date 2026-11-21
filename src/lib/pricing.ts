// Shared pricing rules used by BOTH the checkout UI (for display) and the
// orders API (authoritative). The server never trusts totals sent by the browser.

export const FREE_DELIVERY_THRESHOLD = 499;
export const DELIVERY_FEE = 40;

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

/** Returns the discount for a promo code, or null if the code is invalid. */
export function promoDiscountFor(code: string | null | undefined, subtotal: number): number | null {
  const c = (code || '').trim().toUpperCase();
  if (!c) return 0;
  if (c === 'FRESH10') return Math.round(subtotal * 0.1);
  if (c === 'FREE499') return deliveryFeeFor(subtotal);
  return null;
}

export function computeTotals(subtotal: number, promoCode?: string | null) {
  const deliveryFee = deliveryFeeFor(subtotal);
  const promoDiscount = promoDiscountFor(promoCode, subtotal) ?? 0;
  const total = Math.max(0, Math.round((subtotal + deliveryFee - promoDiscount) * 100) / 100);
  return { subtotal, deliveryFee, promoDiscount, total };
}
