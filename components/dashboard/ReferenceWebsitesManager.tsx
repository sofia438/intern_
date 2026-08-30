"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { addReferenceWebsite, deleteReferenceWebsite, updateReferenceWebsite } from "@/app/actions/profile";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type SavedReferenceWebsite = { id: string; url: string };

const fieldClass =
  "h-12 w-full border border-[#d5d7dd] bg-white px-4 text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100";

function ReferenceWebsiteRow({ site }: { site: SavedReferenceWebsite }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(updateReferenceWebsite, undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state?.message && !state.errors) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="flex items-center gap-4 border-b border-[#ececec] py-3 last:border-0 dark:border-[#3a3a3a]">
        <a href={site.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#041B3A] underline dark:text-[#7fa8ff]">
          {site.url}
        </a>
        <button type="button" onClick={() => setEditing(true)} className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" aria-label={t.referenceWebsitesManager.editWebsite}>
          <Pencil size={18} />
        </button>
        <form action={deleteReferenceWebsite}>
          <input type="hidden" name="id" value={site.id} />
          <button type="submit" className="text-neutral-500 hover:text-red-600 dark:text-neutral-400" aria-label={t.referenceWebsitesManager.deleteWebsite}>
            <Trash2 size={18} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-3 border-b border-[#ececec] py-3 last:border-0 dark:border-[#3a3a3a]">
      <input type="hidden" name="id" value={site.id} />
      <input name="url" defaultValue={site.url} className={`${fieldClass} max-w-md flex-1`} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
      >
        {pending ? t.referenceWebsitesManager.saving : t.common.save}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-sm font-bold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white">
        {t.referenceWebsitesManager.cancel}
      </button>
      {state?.errors?.url && <p className="w-full text-sm text-red-600 dark:text-red-400">{state.errors.url[0]}</p>}
    </form>
  );
}

export default function ReferenceWebsitesManager({ websites }: { websites: SavedReferenceWebsite[] }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(addReferenceWebsite, undefined);
  const [input, setInput] = useState("");

  return (
    <div>
      {websites.length > 0 && (
        <div className="mb-4">
          {websites.map((site) => (
            <ReferenceWebsiteRow key={site.id} site={site} />
          ))}
        </div>
      )}

      <form
        action={action}
        className="flex flex-wrap items-center gap-3"
        onSubmit={() => setInput("")}
      >
        <input
          name="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.referenceWebsitesManager.websitePlaceholder}
          className={`${fieldClass} max-w-md flex-1`}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] px-4 py-2.5 text-sm font-bold text-[#07172b] hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-300 dark:text-neutral-100 dark:hover:bg-[#2e2e2e]"
        >
          <Plus size={16} /> {pending ? t.referenceWebsitesManager.adding : t.referenceWebsitesManager.addWebsite}
        </button>
      </form>
      {state?.errors?.url && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.url[0]}</p>}
    </div>
  );
}
