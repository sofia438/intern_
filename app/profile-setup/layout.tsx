import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { getUser } from "@/lib/dal";

export default async function ProfileSetupLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <LanguageProvider initialLanguage={user?.language ?? "en"}>
      <div className="min-h-screen bg-[#f8f7f6]">
        <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">{children}</main>
      </div>
    </LanguageProvider>
  );
}
