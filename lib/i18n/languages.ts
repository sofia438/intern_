export type LanguageCode = "en" | "de" | "fr" | "tr" | "es" | "ar" | "zh" | "pt" | "it" | "ru";

export type LanguageOption = {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  translated: boolean;
};


export const LANGUAGES: LanguageOption[] = [
  { code: "en", nativeName: "English", englishName: "English", translated: true },
  { code: "es", nativeName: "Español", englishName: "Spanish", translated: true },
  { code: "fr", nativeName: "Français", englishName: "French", translated: true },
  { code: "de", nativeName: "Deutsch", englishName: "German", translated: false },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish", translated: true },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", translated: false },
  { code: "zh", nativeName: "中文", englishName: "Chinese", translated: false },
  { code: "pt", nativeName: "Português", englishName: "Portuguese", translated: false },
  { code: "it", nativeName: "Italiano", englishName: "Italian", translated: false },
  { code: "ru", nativeName: "Русский", englishName: "Russian", translated: false },
];

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}
