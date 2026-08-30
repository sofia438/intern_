"use client";

import { useActionState } from "react";

import { updateChatbotKnowledge } from "@/app/actions/chatbot";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ChatbotKnowledgeForm({ initialKnowledge }: { initialKnowledge: string }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(updateChatbotKnowledge, undefined);

  return (
    <form action={action}>
      <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.chatbotKnowledgeForm.companyKnowledge}</label>
      <textarea
        name="knowledge"
        rows={10}
        defaultValue={initialKnowledge}
        placeholder={t.chatbotKnowledgeForm.placeholder}
        className="w-full rounded border border-[#d5d7dd] bg-white p-4 text-base outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
      />
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {t.chatbotKnowledgeForm.helpText}
      </p>

      {state?.message && <p className="mt-4 text-sm text-[#5b6300] dark:text-[#c7d400]">{state.message}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {pending ? t.chatbotKnowledgeForm.saving : t.chatbotKnowledgeForm.save}
        </button>
      </div>
    </form>
  );
}
