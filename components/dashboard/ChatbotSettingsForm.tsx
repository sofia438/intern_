"use client";

import { useActionState } from "react";

import { updateChatbotSettings } from "@/app/actions/chatbot";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ChatbotSettingsForm({
  initialEnabled,
  initialAssistantName,
  initialGreeting,
  initialThemeColor,
  initialQuickActions,
}: {
  initialEnabled: boolean;
  initialAssistantName: string;
  initialGreeting: string;
  initialThemeColor: string;
  initialQuickActions: string[];
}) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(updateChatbotSettings, undefined);

  return (
    <form action={action}>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="enabled" defaultChecked={initialEnabled} className="h-5 w-5" />
        <span className="font-semibold">{t.chatbotSettingsForm.enableChatbot}</span>
      </label>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.chatbotSettingsForm.assistantName}</span>
          <input
            name="assistantName"
            defaultValue={initialAssistantName}
            className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.chatbotSettingsForm.themeColor}</span>
          <input
            type="color"
            name="themeColor"
            defaultValue={initialThemeColor}
            className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-2 outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e]"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.chatbotSettingsForm.greetingMessage}</span>
        <input
          name="greeting"
          defaultValue={initialGreeting}
          className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.chatbotSettingsForm.quickActions}</span>
        <textarea
          name="quickActions"
          rows={4}
          defaultValue={initialQuickActions.join("\n")}
          className="w-full rounded border border-[#d5d7dd] bg-white p-4 text-base outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
        />
      </label>

      {state?.message && <p className="mt-4 text-sm text-[#5b6300] dark:text-[#c7d400]">{state.message}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {pending ? t.chatbotSettingsForm.saving : t.chatbotSettingsForm.save}
        </button>
      </div>
    </form>
  );
}
