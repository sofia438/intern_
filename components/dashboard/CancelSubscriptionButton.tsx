"use client";

import { useState, useTransition } from "react";

import { cancelSubscription } from "@/app/actions/billing";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CancelSubscriptionButton({ planName }: { planName: string }) {
  const { dictionary: t } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="border border-[#dfe2e7] px-5 py-3 font-bold text-neutral-700 hover:bg-neutral-50 dark:border-[#3a3a3a] dark:text-neutral-200 dark:hover:bg-[#3a3a3a]"
      >
        {t.cancelSubscriptionButton.cancelSubscription}
      </button>
    );
  }

  return (
    <div className="rounded border border-[#dfe2e7] bg-neutral-50 p-6 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
      <h3 className="text-lg font-black dark:text-white">{t.cancelSubscriptionButton.confirmHeading.replace("{plan}", planName)}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {t.cancelSubscriptionButton.confirmBody}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="border border-[#d5d7dd] bg-white px-5 py-2.5 font-bold dark:border-[#3a3a3a] dark:bg-[#242424] dark:text-neutral-100"
        >
          {t.cancelSubscriptionButton.keepSubscription}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => { await cancelSubscription(); setConfirming(false); })}
          className="border border-black bg-black px-5 py-2.5 font-bold text-white disabled:opacity-60"
        >
          {pending ? t.cancelSubscriptionButton.canceling : t.cancelSubscriptionButton.cancelSubscription}
        </button>
      </div>
    </div>
  );
}
