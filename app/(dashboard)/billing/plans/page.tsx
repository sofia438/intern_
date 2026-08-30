import PlanCards from "@/components/dashboard/PlanCards";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const subscription = await prisma.subscription.findUnique({ where: { companyId: session.companyId } });

  return (
    <main className="p-8">
      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tight">{t.billingPlansPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">{t.billingPlansPage.subtitle}</p>
      </div>

      <PlanCards currentPlanId={subscription?.status === "ACTIVE" ? subscription.plan : undefined} />
    </main>
  );
}
