import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import en, { type Dictionary } from "./en";
import es from "./es";
import fr from "./fr";
import tr from "./tr";

const DICTIONARIES: Partial<Record<LanguageCode, Dictionary>> = { en, es, fr, tr };

export function getDictionary(code: LanguageCode): Dictionary {
  return DICTIONARIES[code] ?? en;
}


export function getDictionaryForUser(language: string | null | undefined): Dictionary {
  return getDictionary(isLanguageCode(language ?? "") ? (language as LanguageCode) : "en");
}

export type { Dictionary };
