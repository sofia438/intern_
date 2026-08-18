// Plan definitions live here, not hard-coded into the Billing UI, so pricing/features
// can change without touching the page. Exact prices/features are placeholders —
// per the spec, these aren't finalized yet.
export type PlanId = "BASIC" | "PRO" | "MAX";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  mostPopular?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 49,
    features: [
      "Website Search",
      "Basic Lead Finder",
      "Basic Contact Finder",
      "Basic Reports",
      "100 searches / month",
      "500 leads / month",
      "1 workspace user",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 149,
    mostPopular: true,
    features: [
      "Everything in Basic",
      "Advanced Lead Finder",
      "AI Chatbot",
      "Email Campaigns",
      "Trade Database access",
      "1,000 searches / month",
      "5,000 leads / month",
      "Multiple users",
    ],
  },
  {
    id: "MAX",
    name: "Max",
    price: 399,
    features: [
      "Everything in Pro",
      "All Trade Database providers",
      "Advanced AI features",
      "Higher email & chatbot limits",
      "10,000 searches / month",
      "50,000 leads / month",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

export function isPlanId(value: string): value is PlanId {
  return PLANS.some((p) => p.id === value);
}
