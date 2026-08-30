import { DashboardPage } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { getDashboardOverviewStats, getRecentActivity } from "@/lib/dashboardOverview";

export default async function Page() {
  const session = await verifySession();
  const [stats, recentActivity] = await Promise.all([
    getDashboardOverviewStats(session.companyId),
    getRecentActivity(session.companyId),
  ]);

  return <DashboardPage stats={stats} recentActivity={recentActivity} />;
}
