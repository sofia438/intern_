"use client";

import { useActionState } from "react";

import { updateChatbotSettings } from "@/app/actions/chatbot";

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
  const [state, action, pending] = useActionState(updateChatbotSettings, undefined);

  return (
    <form action={action}>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="enabled" defaultChecked={initialEnabled} className="h-5 w-5" />
        <span className="font-semibold">Enable the chatbot on your website</span>
      </label>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Assistant Name</span>
          <input
            name="assistantName"
            defaultValue={initialAssistantName}
            className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Theme Color</span>
          <input
            type="color"
            name="themeColor"
            defaultValue={initialThemeColor}
            className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-2 outline-none"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Greeting Message</span>
        <input
          name="greeting"
          defaultValue={initialGreeting}
          className="h-12 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Quick Actions (one per line)</span>
        <textarea
          name="quickActions"
          rows={4}
          defaultValue={initialQuickActions.join("\n")}
          className="w-full rounded border border-[#d5d7dd] bg-white p-4 text-base outline-none"
        />
      </label>

      {state?.message && <p className="mt-4 text-sm text-[#5b6300]">{state.message}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Chatbot Settings"}
        </button>
      </div>
    </form>
  );
}
