"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";

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

export async function updateChatbotLanguageSettings(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();
  const languageMode = formData.get("languageMode") === "restricted" ? "restricted" : "automatic";
  const supportedLanguages = formData.getAll("supportedLanguages").map(String);

  if (languageMode === "restricted" && supportedLanguages.length === 0) {
    return { message: "Select at least one language, or switch back to automatic." };
  }

  await prisma.chatbot.upsert({
    where: { companyId: session.companyId },
    create: { companyId: session.companyId, languageMode, supportedLanguages },
    update: { languageMode, supportedLanguages },
  });

  revalidatePath("/settings");
  return { message: "Chatbot language settings saved." };
}

export async function updateChatbotSettings(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();
  const enabled = formData.get("enabled") === "on";
  const assistantName = String(formData.get("assistantName") ?? "").trim() || "AI Assistant";
  const greeting = String(formData.get("greeting") ?? "").trim() || "Hello! How can I help you today?";
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
