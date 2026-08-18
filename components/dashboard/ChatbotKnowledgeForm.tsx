"use client";

import { useActionState } from "react";

import { updateChatbotKnowledge } from "@/app/actions/chatbot";

export default function ChatbotKnowledgeForm({ initialKnowledge }: { initialKnowledge: string }) {
  const [state, action, pending] = useActionState(updateChatbotKnowledge, undefined);

  return (
    <form action={action}>
      <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Company Knowledge</label>
      <textarea
        name="knowledge"
        rows={10}
        defaultValue={initialKnowledge}
        placeholder={
          "Describe your company for the AI chatbot: products, services, industries, countries/markets served, certifications, business hours, contact info, FAQs, etc."
        }
        className="w-full rounded border border-[#d5d7dd] bg-white p-4 text-base outline-none"
      />
      <p className="mt-2 text-sm text-neutral-500">
        The chatbot uses this text to answer visitor questions. Leave it blank and it will answer generically.
      </p>

      {state?.message && <p className="mt-4 text-sm text-[#5b6300]">{state.message}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Knowledge"}
        </button>
      </div>
    </form>
  );
}
