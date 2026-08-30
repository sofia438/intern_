"use client";

import { useMemo, useState } from "react";
import { Activity, Bot, Globe2, Mail, MessageSquare, Search, ShieldCheck, UserRound, Users } from "lucide-react";

import { Card, Pill, Stat } from "@/components/dashboard/DashboardScreens";
import ProfileForm from "@/components/dashboard/ProfileForm";
import CompanyProfileForm from "@/components/dashboard/CompanyProfileForm";
import ProductsManager, { type SavedProduct } from "@/components/dashboard/ProductsManager";
import ReferenceWebsitesManager, { type SavedReferenceWebsite } from "@/components/dashboard/ReferenceWebsitesManager";
import ChatbotSettingsForm from "@/components/dashboard/ChatbotSettingsForm";
import ChatbotKnowledgeForm from "@/components/dashboard/ChatbotKnowledgeForm";
import LanguagePicker from "@/components/dashboard/LanguagePicker";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type TabId = "profile" | "chatbot" | "usage" | "languages";

function getTabs(t: Dictionary): { id: TabId; label: string; icon: typeof UserRound }[] {
  return [
    { id: "profile", label: t.settings.tabs.profile, icon: UserRound },
    { id: "chatbot", label: t.settings.tabs.chatbot, icon: Bot },
    { id: "usage", label: t.settings.tabs.usage, icon: Activity },
    { id: "languages", label: t.settings.tabs.languages, icon: Globe2 },
  ];
}

type SettingsUser = { name: string; email: string; companyName: string; role: string };

type ChatbotConfig = {
  enabled: boolean;
  assistantName: string;
  greeting: string;
  themeColor: string;
  quickActions: string[];
  knowledge: string;
};

type UsageStats = {
  searchJobs: number;
  emailsSent: number;
  conversations: number;
  leads: number;
  teamMembers: number;
};

export default function SettingsPanel({
  user,
  chatbot,
  conversationCount,
  leadCount,
  usage,
  companyProfile,
  products,
  referenceWebsites,
}: {
  user: SettingsUser;
  chatbot: ChatbotConfig;
  conversationCount: number;
  leadCount: number;
  usage: UsageStats;
  companyProfile: { companyName: string; website: string };
  products: SavedProduct[];
  referenceWebsites: SavedReferenceWebsite[];
}) {
  const { dictionary: t } = useLanguage();
  const TABS = getTabs(t);
  const [tab, setTab] = useState<TabId>("profile");
  const [search, setSearch] = useState("");

  const visibleTabs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return TABS;
    return TABS.filter((tabItem) => tabItem.label.toLowerCase().includes(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, t]);

  return (
    <main className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{t.settings.title}</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400 sm:text-xl">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <label className="mb-4 flex h-11 items-center gap-2 rounded border border-[#d5d7dd] bg-white px-3 text-sm text-neutral-500 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-400">
            <Search size={16} className="shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.settings.searchPlaceholder}
              className="w-full min-w-0 bg-transparent outline-none"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {visibleTabs.map((tabItem) => {
              const Icon = tabItem.icon;
              const active = tab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setTab(tabItem.id)}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded px-4 py-3 text-left text-base transition lg:w-full ${
                    active
                      ? "bg-[#f0efed] font-bold text-black dark:bg-[#3a3a3a] dark:text-white"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-[#2e2e2e]"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  {tabItem.label}
                </button>
              );
            })}
            {visibleTabs.length === 0 && (
              <p className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{t.settings.noMatch} &quot;{search}&quot;.</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          {tab === "profile" && (
            <div className="space-y-8">
              <Card title={t.settingsExtra.accountDetails}>
                <ProfileForm name={user.name} />

                <div className="mt-8 grid grid-cols-1 gap-8 border-t border-[#ececec] pt-8 dark:border-[#3a3a3a] sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-xs uppercase text-neutral-500 dark:text-neutral-400">{t.settingsExtra.email}</p>
                    <p className="mt-1 text-lg">{user.email}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase text-neutral-500 dark:text-neutral-400">{t.settingsExtra.company}</p>
                    <p className="mt-1 text-lg">{user.companyName}</p>
                  </div>
                </div>
              </Card>

              <Card title={t.settingsExtra.role}>
                <Pill tone="dark">{user.role}</Pill>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                  {user.role === "ADMIN"
                    ? t.settingsExtra.roleAdmin
                    : t.settingsExtra.roleMember}
                </p>
              </Card>

              <Card title={t.settingsExtra.companyInfo} subtitle={t.settingsExtra.companyInfoSubtitle}>
                <CompanyProfileForm companyName={companyProfile.companyName} website={companyProfile.website} />
              </Card>

              <Card title={t.settingsExtra.products} subtitle={t.settingsExtra.productsSubtitle}>
                <ProductsManager products={products} />
              </Card>

              <Card title={t.settingsExtra.referenceWebsites} subtitle={t.settingsExtra.referenceWebsitesSubtitle}>
                <ReferenceWebsitesManager websites={referenceWebsites} />
              </Card>
            </div>
          )}

          {tab === "chatbot" && (
            <div className="space-y-8">
              <Card title={t.settingsExtra.chatbotIdentity} subtitle={t.settingsExtra.chatbotIdentitySubtitle}>
                <ChatbotSettingsForm
                  initialEnabled={chatbot.enabled}
                  initialAssistantName={chatbot.assistantName}
                  initialGreeting={chatbot.greeting}
                  initialThemeColor={chatbot.themeColor}
                  initialQuickActions={chatbot.quickActions}
                />
              </Card>

              <Card title={t.settingsExtra.chatbotKnowledge} subtitle={t.settingsExtra.chatbotKnowledgeSubtitle}>
                <ChatbotKnowledgeForm initialKnowledge={chatbot.knowledge} />
              </Card>

              <Card title={t.settingsExtra.chatbotActivity} subtitle={t.settingsExtra.chatbotActivitySubtitle}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <a
                    href="/settings/chatbot/conversations"
                    className="block rounded border border-[#dfe2e7] p-6 hover:bg-neutral-50 dark:border-[#3a3a3a] dark:hover:bg-[#2e2e2e]"
                  >
                    <strong className="block text-4xl font-black dark:text-white">{conversationCount}</strong>
                    <span className="mt-2 block font-bold dark:text-neutral-200">{t.settingsExtra.conversations}</span>
                  </a>
                  <a
                    href="/settings/chatbot/leads"
                    className="block rounded border border-[#dfe2e7] p-6 hover:bg-neutral-50 dark:border-[#3a3a3a] dark:hover:bg-[#2e2e2e]"
                  >
                    <strong className="block text-4xl font-black dark:text-white">{leadCount}</strong>
                    <span className="mt-2 block font-bold dark:text-neutral-200">{t.settingsExtra.leads}</span>
                  </a>
                </div>
              </Card>
            </div>
          )}

          {tab === "usage" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label={t.settingsExtra.searchJobsRun} value={usage.searchJobs.toLocaleString()} note={t.settingsExtra.searchJobsRunNote} icon={<Search size={22} />} />
              <Stat label={t.settingsExtra.emailsSent} value={usage.emailsSent.toLocaleString()} note={t.settingsExtra.emailsSentNote} icon={<Mail size={22} />} />
              <Stat label={t.settingsExtra.chatbotConversations} value={usage.conversations.toLocaleString()} note={t.settingsExtra.chatbotConversationsNote} icon={<MessageSquare size={22} />} />
              <Stat label={t.settingsExtra.leadsCaptured} value={usage.leads.toLocaleString()} note={t.settingsExtra.leadsCapturedNote} icon={<ShieldCheck size={22} />} />
              <Stat label={t.settingsExtra.teamMembers} value={usage.teamMembers.toLocaleString()} note={t.settingsExtra.teamMembersNote} icon={<Users size={22} />} />
            </div>
          )}

          {tab === "languages" && (
            <div className="space-y-8">
              <Card>
                <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                  {t.settingsExtra.languagesNote}
                </p>
                <LanguagePicker />
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
