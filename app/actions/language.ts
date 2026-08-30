"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { isLanguageCode, LANGUAGES } from "@/lib/i18n/languages";
import { getChatbotDefaults, isDefaultChatbotField } from "@/lib/chatbot/defaults";


export async function updateLanguage(language: string): Promise<void> {
  if (!isLanguageCode(language)) return;

  const session = await verifySession();
  const englishName = LANGUAGES.find((l) => l.code === language)!.englishName;

  await prisma.user.update({
    where: { id: session.userId },
    data: { language },
  });

  const defaults = getChatbotDefaults(language);
  const chatbot = await prisma.chatbot.findUnique({ where: { companyId: session.companyId } });

  
  const contentUpdate: Partial<typeof defaults> = {};
  if (!chatbot || isDefaultChatbotField("assistantName", chatbot.assistantName)) {
    contentUpdate.assistantName = defaults.assistantName;
  }
  if (!chatbot || isDefaultChatbotField("greeting", chatbot.greeting)) {
    contentUpdate.greeting = defaults.greeting;
  }
  if (!chatbot || isDefaultChatbotField("quickActions", chatbot.quickActions)) {
    contentUpdate.quickActions = defaults.quickActions;
  }

  await prisma.chatbot.upsert({
    where: { companyId: session.companyId },
    create: { companyId: session.companyId, languageMode: "restricted", supportedLanguages: [englishName], ...defaults },
    update: { languageMode: "restricted", supportedLanguages: [englishName], ...contentUpdate },
  });

  revalidatePath("/", "layout");
  revalidatePath("/settings");
}
