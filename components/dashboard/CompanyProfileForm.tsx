"use client";

import { useActionState } from "react";

import { saveCompanyProfile } from "@/app/actions/profile";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CompanyProfileForm({ companyName, website }: { companyName: string; website: string }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(saveCompanyProfile, undefined);

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.companyProfileForm.companyName}</span>
          <input
            name="companyName"
            defaultValue={companyName}
            className="h-14 w-full border border-[#d5d7dd] bg-white px-5 text-lg outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
          />
          {state?.errors?.companyName && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.companyName[0]}</p>}
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.companyProfileForm.companyWebsite}</span>
          <input
            name="website"
            defaultValue={website}
            placeholder={t.companyProfileForm.websitePlaceholder}
            className="h-14 w-full border border-[#d5d7dd] bg-white px-5 text-lg outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
          />
        </label>
      </div>

      {state?.message && <p className="text-sm text-[#5b6300] dark:text-[#c7d400]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-5 py-3 font-bold text-white disabled:opacity-60 dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
      >
        {pending ? t.companyProfileForm.saving : t.companyProfileForm.save}
      </button>
    </form>
  );
}
