import "server-only";

import { prisma } from "@/lib/prisma";
import type { NotificationItem } from "@/lib/notificationsShared";

export type { NotificationItem, NotificationType } from "@/lib/notificationsShared";

const PER_SOURCE_LIMIT = 10;
const TOTAL_LIMIT = 15;

export async function getRecentActivity(companyId: string): Promise<NotificationItem[]> {
  const [searchJobs, campaigns, leads] = await Promise.all([
    prisma.searchJob.findMany({
      where: { companyId, status: { in: ["COMPLETED", "FAILED"] }, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: PER_SOURCE_LIMIT,
      select: { id: true, productName: true, status: true, resultsCount: true, completedAt: true },
    }),
    prisma.emailCampaign.findMany({
      where: { companyId, status: { in: ["COMPLETED", "FAILED"] }, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: PER_SOURCE_LIMIT,
      select: { id: true, subject: true, status: true, completedAt: true, recipients: { select: { status: true } } },
    }),
    prisma.lead.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_LIMIT,
      select: { id: true, name: true, companyName: true, createdAt: true },
    }),
  ]);

  const items: NotificationItem[] = [];

  for (const job of searchJobs) {
    if (!job.completedAt) continue;
    const failed = job.status === "FAILED";
    items.push({
      id: `search-${job.id}`,
      type: "search",
      title: failed ? `Search for "${job.productName}" failed` : `Search for "${job.productName}" completed`,
      description: failed ? "The search job could not finish — open it for details." : `${job.resultsCount} result${job.resultsCount === 1 ? "" : "s"} found`,
      href: `/lead-finder/results/${job.id}`,
      timestamp: job.completedAt.toISOString(),
    });
  }

  for (const campaign of campaigns) {
    if (!campaign.completedAt) continue;
    const failed = campaign.status === "FAILED";
    const sentCount = campaign.recipients.filter((r) => r.status === "SENT").length;
    items.push({
      id: `campaign-${campaign.id}`,
      type: "campaign",
      title: failed ? `Campaign "${campaign.subject}" failed` : `Campaign "${campaign.subject}" sent`,
      description: failed ? "The campaign could not complete — open it for details." : `Delivered to ${sentCount} recipient${sentCount === 1 ? "" : "s"}`,
      href: `/email-campaigns/${campaign.id}`,
      timestamp: campaign.completedAt.toISOString(),
    });
  }

  for (const lead of leads) {
    items.push({
      id: `lead-${lead.id}`,
      type: "lead",
      title: `New chatbot lead: ${lead.name}`,
      description: lead.companyName ?? "No company provided",
      href: `/settings/chatbot/leads`,
      timestamp: lead.createdAt.toISOString(),
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, TOTAL_LIMIT);
}
