
export type PlanId = "BASIC" | "PRO" | "MAX";


export type PlanLimits = { searches: number; leads: number; emails: number; chatbotConversations: number };

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  mostPopular?: boolean;
  features: string[];
  limits: PlanLimits;
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
    limits: { searches: 100, leads: 500, emails: 0, chatbotConversations: 0 },
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
    limits: { searches: 1000, leads: 5000, emails: 5000, chatbotConversations: 1000 },
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
    limits: { searches: 10000, leads: 50000, emails: 20000, chatbotConversations: 5000 },
  },
];

export function isPlanId(value: string): value is PlanId {
  return PLANS.some((p) => p.id === value);
}
