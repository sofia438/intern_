import Link from "next/link";
import { notFound } from "next/navigation";

import { PLANS } from "@/lib/billing/plans";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planId } = await searchParams;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) notFound();

  const session = await verifySession();
  const subscription = await prisma.subscription.findUnique({ where: { companyId: session.companyId } });
  if (!subscription) notFound();

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-md border border-[#dfe2e7] bg-white p-10 text-center dark:border-[#3a3a3a] dark:bg-[#242424]">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-3xl font-black dark:text-white">Payment Successful</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Your {plan.name} plan is now active.</p>

        <div className="mt-8 space-y-2 border-t border-[#ececec] pt-6 text-left dark:border-[#3a3a3a]">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Plan</span>
            <strong className="dark:text-white">{plan.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Billing</span>
            <strong className="dark:text-white">${plan.price} / month</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Next billing date</span>
            <strong className="dark:text-white">{subscription.nextBillingDate.toDateString()}</strong>
          </div>
        </div>

        <Link
          href="/billing"
          className="mt-8 block w-full bg-black py-4 text-center text-lg font-black text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-white"
        >
          Go to Billing →
        </Link>
      </div>
    </main>
  );
}
