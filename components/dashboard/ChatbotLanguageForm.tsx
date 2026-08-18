"use client";

import { useActionState, useState } from "react";

import { updateChatbotLanguageSettings } from "@/app/actions/chatbot";

const LANGUAGE_OPTIONS = [
  "English",
  "German",
  "French",
  "Turkish",
  "Spanish",
  "Arabic",
  "Chinese",
  "Portuguese",
  "Italian",
  "Russian",
];

export default function ChatbotLanguageForm({
  initialMode,
  initialLanguages,
}: {
  initialMode: string;
  initialLanguages: string[];
}) {
  const [state, action, pending] = useActionState(updateChatbotLanguageSettings, undefined);
  const [mode, setMode] = useState(initialMode === "restricted" ? "restricted" : "automatic");

  return (
    <form action={action}>
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3">
          <input
            type="radio"
            name="languageMode"
            value="automatic"
            checked={mode === "automatic"}
            onChange={() => setMode("automatic")}
            className="mt-1"
          />
          <span>
            <strong>Automatic</strong>
            <span className="block text-sm text-neutral-600">Reply in whatever language the visitor writes in.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="radio"
            name="languageMode"
            value="restricted"
            checked={mode === "restricted"}
            onChange={() => setMode("restricted")}
            className="mt-1"
          />
          <span>
            <strong>Restricted</strong>
            <span className="block text-sm text-neutral-600">Only reply in the languages you select below.</span>
          </span>
        </label>
      </div>

      <div className={`mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 ${mode === "automatic" ? "opacity-40" : ""}`}>
        {LANGUAGE_OPTIONS.map((lang) => (
          <label key={lang} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="supportedLanguages"
              value={lang}
              defaultChecked={initialLanguages.includes(lang)}
              disabled={mode === "automatic"}
            />
            {lang}
          </label>
        ))}
      </div>

      {state?.message && <p className="mt-4 text-sm text-[#5b6300]">{state.message}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Language Settings"}
        </button>
      </div>
    </form>
  );
}
