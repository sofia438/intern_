"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";

import { updateLanguage } from "@/app/actions/language";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";

type LanguageContextValue = {
  language: LanguageCode;
  dictionary: Dictionary;
  setLanguage: (code: LanguageCode) => void;
  pending: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: string;
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(
    isLanguageCode(initialLanguage) ? initialLanguage : "en"
  );
  const [pending, startTransition] = useTransition();

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    startTransition(async () => {
      await updateLanguage(code);
    });
  }, []);

  const value = useMemo(
    () => ({ language, dictionary: getDictionary(language), setLanguage, pending }),
    [language, setLanguage, pending]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
