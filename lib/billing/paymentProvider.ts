// TEST-MODE payment processing only — no real payment provider is connected yet.
// Never stores raw card numbers or CVCs; only derives what a real provider would
// return (brand/last4/expiry) for display. Deliberately uses Stripe's own published
// test card numbers (https://docs.stripe.com/testing) so this file is a clean
// drop-in swap for the real Stripe SDK later — same numbers, same outcomes.
export type PaymentDeclineReason = "card_declined" | "insufficient_funds" | "invalid_card";

export type PaymentResult = { success: true; brand: string; last4: string } | { success: false; reason: PaymentDeclineReason };

const DECLINED_CARD = "4000000000000002";
const INSUFFICIENT_FUNDS_CARD = "4000000000009995";

function detectBrand(digits: string): string {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

export function mockChargeCard(rawCardNumber: string): PaymentResult {
  const digits = rawCardNumber.replace(/\s+/g, "");

  if (!/^\d{12,19}$/.test(digits)) {
    return { success: false, reason: "invalid_card" };
  }
  if (digits === INSUFFICIENT_FUNDS_CARD) {
    return { success: false, reason: "insufficient_funds" };
  }
  if (digits === DECLINED_CARD) {
    return { success: false, reason: "card_declined" };
  }

  return { success: true, brand: detectBrand(digits), last4: digits.slice(-4) };
}

export const PAYMENT_DECLINE_MESSAGES: Record<PaymentDeclineReason, string> = {
  card_declined: "Your card was declined. Please try a different card.",
  insufficient_funds: "Your card has insufficient funds. Please try a different card.",
  invalid_card: "That card number doesn't look valid. Please check it and try again.",
};
