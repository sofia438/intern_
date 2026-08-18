import PlanCards from "@/components/dashboard/PlanCards";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await verifySession();
  const subscription = await prisma.subscription.findUnique({ where: { companyId: session.companyId } });

  return (
    <main className="p-8">
      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tight">Change Plan</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">Pick a new plan below. Your billing updates immediately.</p>
      </div>

      <PlanCards currentPlanId={subscription?.status === "ACTIVE" ? subscription.plan : undefined} />
    </main>
  );
}
