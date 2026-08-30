import Link from "next/link";
import { CreditCard, Download } from "lucide-react";

import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PlanCards from "@/components/dashboard/PlanCards";
import { PLANS } from "@/lib/billing/plans";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const [subscription, paymentMethod, invoices] = await Promise.all([
    prisma.subscription.findUnique({ where: { companyId: session.companyId } }),
    prisma.paymentMethod.findUnique({ where: { companyId: session.companyId } }),
    prisma.invoice.findMany({ where: { companyId: session.companyId }, orderBy: { billingDate: "desc" } }),
  ]);

  if (!subscription) {
    return (
      <main className="p-8">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight">{t.billingPage.title}</h1>
          <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
            {t.billingPage.subtitleNoSub}
          </p>
        </div>

        <PlanCards />
      </main>
    );
  }

  const plan = PLANS.find((p) => p.id === subscription.plan);

  return (
    <main className="p-8">
      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tight">{t.billingPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">{t.billingPage.subtitleSubscribed}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-md border border-[#dfe2e7] bg-white p-7 dark:border-[#3a3a3a] dark:bg-[#242424]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black dark:text-white">{t.billingPage.currentPlanSummary}</h2>
            <Link
              href="/billing/plans"
              className="border border-black bg-black px-5 py-2.5 font-bold text-white hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-black dark:hover:bg-white"
            >
              {t.billingPage.changePlan}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <small className="block font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{t.billingPage.planName}</small>
              <strong className="text-xl dark:text-white">{plan?.name ?? subscription.plan}</strong>
            </div>
            <div>
              <small className="block font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{t.billingPage.billingCycle}</small>
              <strong className="text-xl dark:text-white">{t.billingPage.monthly}</strong>
            </div>
            <div>
              <small className="block font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{t.billingPage.planCost}</small>
              <strong className="text-xl dark:text-white">${plan?.price ?? "—"}</strong>
            </div>
          </div>

          <div className="mt-6 border-t border-[#ececec] pt-6 dark:border-[#3a3a3a]">
            <small className="block font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">{t.billingPage.status}</small>
            <strong className={subscription.status === "ACTIVE" ? "text-[#5b6300] dark:text-[#c7d400]" : "text-red-600 dark:text-red-400"}>
              {subscription.status === "ACTIVE" ? t.billingPage.active : t.billingPage.canceled}
            </strong>
            {subscription.status === "ACTIVE" && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t.billingPage.nextBillingDate.replace("{date}", subscription.nextBillingDate.toDateString())}
              </p>
            )}
          </div>

          {subscription.status === "ACTIVE" && (
            <div className="mt-6">
              <CancelSubscriptionButton planName={plan?.name ?? subscription.plan} />
            </div>
          )}
        </div>

        <div className="rounded-md border border-[#dfe2e7] bg-white p-7 dark:border-[#3a3a3a] dark:bg-[#242424]">
          <h2 className="mb-6 text-2xl font-black dark:text-white">{t.billingPage.paymentMethod}</h2>
          {paymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded bg-[#f1eee8] dark:bg-[#3a3a3a] dark:text-neutral-200">
                  <CreditCard size={22} />
                </span>
                <div>
                  <strong className="block dark:text-white">{paymentMethod.brand}</strong>
                  <span className="text-neutral-600 dark:text-neutral-300">•••• •••• •••• {paymentMethod.last4}</span>
                  <small className="block text-neutral-500 dark:text-neutral-400">
                    {t.billingPage.expires.replace("{month}", String(paymentMethod.expiryMonth).padStart(2, "0")).replace("{year}", String(paymentMethod.expiryYear))}
                  </small>
                </div>
              </div>
              <Link
                href={`/billing/checkout?plan=${subscription.plan}`}
                className="border border-[#d5d7dd] px-5 py-2.5 font-bold hover:bg-neutral-50 dark:border-[#3a3a3a] dark:text-neutral-100 dark:hover:bg-[#3a3a3a]"
              >
                {t.billingPage.change}
              </Link>
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">{t.billingPage.noPaymentMethod}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black dark:text-white">{t.billingPage.invoices}</h2>
            <p className="text-neutral-600 dark:text-neutral-400">{t.billingPage.billingHistory}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-[#dfe2e7] dark:border-[#3a3a3a]">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:bg-[#3a3a3a] dark:text-neutral-300">
              <tr>
                <th className="p-4">{t.billingPage.tableInvoiceId}</th>
                <th className="p-4">{t.billingPage.tableBillingDate}</th>
                <th className="p-4">{t.billingPage.tablePlan}</th>
                <th className="p-4">{t.billingPage.tableAmount}</th>
                <th className="p-4">{t.billingPage.tableStatus}</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#242424]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                    {t.billingPage.noInvoicesYet}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-[#e5e5e5] dark:border-[#3a3a3a] dark:text-neutral-100">
                    <td className="p-4">
                      <strong className="dark:text-white">#{invoice.id.slice(-6).toUpperCase()}</strong>
                    </td>
                    <td className="p-4">{invoice.billingDate.toDateString()}</td>
                    <td className="p-4">{PLANS.find((p) => p.id === invoice.plan)?.name ?? invoice.plan}</td>
                    <td className="p-4">${invoice.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded bg-[#efeeec] px-3 py-1 font-mono text-xs dark:bg-[#3a3a3a] dark:text-neutral-200">
                        {t.common.status.invoice[invoice.status as "PAID"] ?? invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/api/billing/invoices/${invoice.id}/download`}
                        className="inline-flex items-center gap-1 font-bold hover:underline"
                      >
                        <Download size={16} /> {t.billingPage.download}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
