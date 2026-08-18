import Link from "next/link";
import { Check } from "lucide-react";

import { PLANS } from "@/lib/billing/plans";

export default function PlanCards({ currentPlanId }: { currentPlanId?: string }) {
  return (
    <div className="grid grid-cols-3 gap-8">
      {PLANS.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        return (
          <div
            key={plan.id}
            className={`relative rounded-md border bg-white p-8 dark:bg-[#242424] ${plan.mostPopular ? "border-black dark:border-white" : "border-[#dfe2e7] dark:border-[#3a3a3a]"}`}
          >
            {plan.mostPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#e7f600] px-4 py-1 font-mono text-xs font-bold uppercase tracking-wide text-black">
                Most Popular
              </span>
            )}

            <h2 className="text-center font-mono text-sm uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{plan.name}</h2>
            <div className="mt-4 text-center">
              <span className="text-5xl font-black dark:text-white">${plan.price}</span>
              <span className="text-neutral-500 dark:text-neutral-400"> / month</span>
            </div>

            <ul className="mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm dark:text-neutral-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5b6300] dark:text-[#c7d400]" />
                  {feature}
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <span className="mt-8 block w-full bg-neutral-100 py-4 text-center text-lg font-black text-neutral-400 dark:bg-[#3a3a3a] dark:text-neutral-500">
                Current Plan
              </span>
            ) : (
              <Link
                href={`/billing/checkout?plan=${plan.id}`}
                className="mt-8 block w-full bg-black py-4 text-center text-lg font-black text-white hover:bg-neutral-800"
              >
                Choose {plan.name}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
