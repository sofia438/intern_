import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardScreens";
import ChatWidget from "@/components/chatbot/ChatWidget";
import { getUser, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const session = await verifySession();

  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    select: { profileCompletedAt: true },
  });
  if (!company?.profileCompletedAt) redirect("/profile-setup");

  const chatbot = await prisma.chatbot.findUnique({ where: { companyId: session.companyId } });

  return (
    <DashboardShell user={user}>
      {children}
      {chatbot?.enabled && (
        <ChatWidget
          companyId={session.companyId}
          assistantName={chatbot.assistantName}
          greeting={chatbot.greeting}
          themeColor={chatbot.themeColor}
          quickActions={chatbot.quickActions}
        />
      )}
    </DashboardShell>
  );
}
