"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getChatbotDefaults } from "@/lib/chatbot/defaults";

export async function updateChatbotKnowledge(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();
  const knowledge = String(formData.get("knowledge") ?? "").trim();

  await prisma.chatbot.upsert({
    where: { companyId: session.companyId },
    create: { companyId: session.companyId, knowledge: knowledge || null },
    update: { knowledge: knowledge || null },
  });

  revalidatePath("/settings");
  return { message: "Chatbot knowledge saved." };
}

export async function updateChatbotSettings(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();
  const user = await getUser();
  const defaults = getChatbotDefaults(user?.language ?? "en");
  const enabled = formData.get("enabled") === "on";
  const assistantName = String(formData.get("assistantName") ?? "").trim() || defaults.assistantName;
  const greeting = String(formData.get("greeting") ?? "").trim() || defaults.greeting;
  const themeColor = String(formData.get("themeColor") ?? "").trim() || "#4f46e5";
  const quickActions = String(formData.get("quickActions") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  await prisma.chatbot.upsert({
    where: { companyId: session.companyId },
    create: { companyId: session.companyId, enabled, assistantName, greeting, themeColor, quickActions },
    update: { enabled, assistantName, greeting, themeColor, quickActions },
  });

  revalidatePath("/settings");
  return { message: "Chatbot settings saved." };
}
