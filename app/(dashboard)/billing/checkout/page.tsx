import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import CheckoutForm from "@/components/dashboard/CheckoutForm";
import { PLANS } from "@/lib/billing/plans";

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planId } = await searchParams;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tight">Complete Your Purchase</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
          Review your plan and payment details before completing your subscription.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-8">
        <div className="h-fit rounded-md border border-[#dfe2e7] bg-white p-7 dark:border-[#3a3a3a] dark:bg-[#242424]">
          <h2 className="font-mono text-sm uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{plan.name} Plan</h2>
          <div className="mt-2">
            <span className="text-4xl font-black dark:text-white">${plan.price}</span>
            <span className="text-neutral-500 dark:text-neutral-400"> / month</span>
          </div>

          <ul className="mt-6 space-y-3 border-t border-[#ececec] pt-6 dark:border-[#3a3a3a]">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm dark:text-neutral-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5b6300] dark:text-[#c7d400]" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-[#ececec] pt-6 text-sm dark:border-[#3a3a3a] dark:text-neutral-200">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
              <span>${plan.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Tax / VAT</span>
              <span className="text-neutral-500 dark:text-neutral-400">Calculated based on billing information</span>
            </div>
            <div className="flex justify-between border-t border-[#ececec] pt-2 text-lg font-black dark:border-[#3a3a3a] dark:text-white">
              <span>Total today</span>
              <span>${plan.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#dfe2e7] bg-white p-7 dark:border-[#3a3a3a] dark:bg-[#242424]">
          <CheckoutForm plan={plan} />
        </div>
      </div>
    </main>
  );
}
