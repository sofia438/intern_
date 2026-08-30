import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { getUser, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getChatbotDefaults } from "@/lib/chatbot/defaults";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  if (!user) return null;

  const [chatbot, conversationCount, leadCount, searchJobCount, emailsSentCount, teamMemberCount, company, products, productsWithImage, referenceWebsites] = await Promise.all([
    prisma.chatbot.findUnique({ where: { companyId: session.companyId } }),
    prisma.conversation.count({ where: { companyId: session.companyId } }),
    prisma.lead.count({ where: { companyId: session.companyId } }),
    prisma.searchJob.count({ where: { companyId: session.companyId } }),
    prisma.emailRecipient.count({ where: { status: "SENT", campaign: { companyId: session.companyId } } }),
    prisma.user.count({ where: { companyId: session.companyId } }),
    prisma.company.findUnique({ where: { id: session.companyId } }),
    prisma.product.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, englishName: true, hsCode: true },
    }),
    prisma.product.findMany({
      where: { companyId: session.companyId, image: { not: null } },
      select: { id: true },
    }),
    prisma.referenceWebsite.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "asc" } }),
  ]);
  const imageProductIds = new Set(productsWithImage.map((p) => p.id));
  const chatbotDefaults = getChatbotDefaults(user.language);

  return (
    <SettingsPanel
      user={{ name: user.name, email: user.email, companyName: user.companyName, role: user.role }}
      chatbot={{
        enabled: chatbot?.enabled ?? false,
        assistantName: chatbot?.assistantName ?? chatbotDefaults.assistantName,
        greeting: chatbot?.greeting ?? chatbotDefaults.greeting,
        themeColor: chatbot?.themeColor ?? "#4f46e5",
        quickActions: chatbot?.quickActions ?? chatbotDefaults.quickActions,
        knowledge: chatbot?.knowledge ?? "",
      }}
      conversationCount={conversationCount}
      leadCount={leadCount}
      companyProfile={{ companyName: company?.name ?? user.companyName, website: company?.website ?? "" }}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        englishName: p.englishName,
        hsCode: p.hsCode,
        hasImage: imageProductIds.has(p.id),
      }))}
      referenceWebsites={referenceWebsites.map((w) => ({ id: w.id, url: w.url }))}
      usage={{
        searchJobs: searchJobCount,
        emailsSent: emailsSentCount,
        conversations: conversationCount,
        leads: leadCount,
        teamMembers: teamMemberCount,
      }}
    />
  );
}
