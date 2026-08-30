"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 150; 

export default function LeadFinderResultsPoll() {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const pollCount = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current > MAX_POLLS) {
        clearInterval(interval);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <p className="mt-4 text-sm text-neutral-500">
      {t.leadFinderResultsPoll.stillRunning}
    </p>
  );
}
