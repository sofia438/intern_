"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Database,
  Download,
  Eye,
  Globe2,
  Grid2X2,
  LogOut,
  Mail,
  Menu,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";

import { logout } from "@/app/actions/auth";
import LocationPromptModal from "@/components/dashboard/LocationPromptModal";
import NotificationBell from "@/components/dashboard/NotificationBell";
import HeaderSearch from "@/components/dashboard/HeaderSearch";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import GeographicDistribution from "@/components/dashboard/GeographicDistribution";
import { KpiDelta } from "@/components/dashboard/ReportsCharts";
import type { DashboardOverviewStats, RecentActivityRow } from "@/lib/dashboardOverview";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { GeoDistribution } from "@/lib/visitorIntelligenceShared";

function getNavItems(t: Dictionary) {
  return [
    { label: t.nav.dashboard, href: "/dashboard", icon: Grid2X2 },
    { label: t.nav.visitorIntelligence, href: "/visitor-intelligence", icon: Eye },
    { label: t.nav.leadFinder, href: "/lead-finder", icon: Search },
    { label: t.nav.tradeDatabases, href: "/trade-databases", icon: Database },
    { label: t.nav.contactFinder, href: "/contact-finder", icon: Users },
    { label: t.nav.emailCampaigns, href: "/email-campaigns", icon: Mail },
    { label: t.nav.reports, href: "/reports", icon: BarChart3 },
    { label: t.nav.billing, href: "/billing", icon: ShieldCheck },
    { label: t.nav.settings, href: "/settings", icon: Settings },
  ];
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DashboardUser = { name: string; email: string; role: string; companyName: string; language: string; needsLocationPrompt: boolean } | null;

export function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  return (
    <LanguageProvider initialLanguage={user?.language ?? "en"}>
      <DashboardShellInner user={user}>{children}</DashboardShellInner>
    </LanguageProvider>
  );
}

function DashboardShellInner({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dictionary: t } = useLanguage();
  const navItems = getNavItems(t);
  const initials = user
    ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f8f7f6] text-[#050b1d] dark:bg-[#1a1a1a] dark:text-neutral-100">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          "fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-[#d8d8d8] bg-white transition-transform duration-200 dark:border-[#3a3a3a] dark:bg-[#242424] md:translate-x-0 md:max-[1199px]:w-20 min-[1200px]:w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-8 py-8 md:max-[1199px]:justify-center md:max-[1199px]:px-0">
          <Link href="/dashboard" className="flex items-center gap-4">
            <Image src="/images/logo.png" alt="GlobalExpo Logo" width={40} height={40} className="object-contain" />
            <span className="leading-tight md:max-[1199px]:hidden">
              <strong className="block text-2xl font-black tracking-tight">GlobalExpo</strong>
              <small className="font-mono text-sm uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">{t.nav.tagline}</small>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-5 md:max-[1199px]:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cx(
                  "flex items-center gap-4 px-5 py-3 text-lg transition md:max-[1199px]:justify-center md:max-[1199px]:px-2",
                  active
                    ? "border-r-2 border-black bg-[#f0efed] font-bold text-black dark:border-white dark:bg-[#3a3a3a] dark:text-white"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-[#3a3a3a]"
                )}
              >
                <Icon size={24} className="shrink-0" />
                <span className="md:max-[1199px]:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:max-[1199px]:pl-20 min-[1200px]:pl-[280px]">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-3 border-b border-[#d8d8d8] bg-white/95 px-4 backdrop-blur dark:border-[#3a3a3a] dark:bg-[#242424]/95 md:max-[1199px]:px-6 min-[1200px]:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="shrink-0 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2 md:hidden">
              <Image src="/images/logo.png" alt="GlobalExpo Logo" width={28} height={28} className="object-contain" />
              <strong className="text-lg font-black tracking-tight">GlobalExpo</strong>
            </Link>
            <HeaderSearch placeholder={t.header.searchPlaceholder} />
          </div>
          <div className="flex shrink-0 items-center gap-3 md:gap-5">
            <Link className="hidden font-mono text-sm lg:inline" href="/trade-databases">{t.header.marketplace}</Link>
            <Link className="hidden font-mono text-sm lg:inline" href="/reports">{t.header.documentation}</Link>
            <NotificationBell />
            <ThemeToggle />
            <Link
              href="/billing"
              className="hidden rounded-full bg-[#f3efe3] px-5 py-3 font-mono text-sm transition hover:bg-[#ece5d1] dark:bg-[#3a3a3a] dark:text-neutral-200 dark:hover:bg-[#454545] sm:inline-block"
            >
              {t.header.enterprisePlan}
            </Link>
            <div className="flex items-center gap-3 border-l pl-3 dark:border-[#3a3a3a] md:pl-5">
              <Link href="/settings" className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dfe5ec] font-bold dark:bg-[#3a3a3a] dark:text-white">{initials}</span>
                <span className="hidden xl:block leading-tight">
                  <strong>{user?.name ?? "Guest"}</strong>
                  <small className="block uppercase text-neutral-500 dark:text-neutral-400">{user?.role ?? ""}</small>
                </span>
              </Link>
              <form action={logout}>
                <button type="submit" title={t.header.logout} className="text-neutral-500 transition hover:text-black dark:text-neutral-400 dark:hover:text-white">
                  <LogOut size={20} />
                </button>
              </form>
            </div>
          </div>
        </header>
        {children}
      </div>
      <LocationPromptModal show={user?.needsLocationPrompt ?? false} />
    </div>
  );
}

function Page({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return <main className="p-4 sm:p-8"><div className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><h1 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>{subtitle ? <p className="mt-2 text-lg text-neutral-600 sm:text-xl">{subtitle}</p> : null}</div>{actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}</div>{children}</main>;
}

export function Button({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" | "acid" }) {
  return <button className={cx("inline-flex items-center gap-2 border px-5 py-3 font-bold", tone === "dark" && "border-[#07172b] bg-[#07172b] text-white", tone === "light" && "border-[#d5d7dd] bg-white dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100", tone === "acid" && "border-[#e7f600] bg-[#e7f600] text-black")}>{children}</button>;
}

export function Card({ title, subtitle, children, className }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={cx("rounded-md border border-[#dfe2e7] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#242424]", className)}>{title ? <div className="border-b border-[#ececec] p-7 dark:border-[#3a3a3a]"><h2 className="text-3xl font-black dark:text-white">{title}</h2>{subtitle ? <p className="mt-1 text-neutral-600 dark:text-neutral-400">{subtitle}</p> : null}</div> : null}<div className="p-7">{children}</div></section>;
}

export function Stat({ label, value, note, icon }: { label: string; value: string; note: React.ReactNode; icon: React.ReactNode }) {
  return <Card className="min-h-[145px]"><div className="flex justify-between"><div><p className="text-neutral-600 dark:text-neutral-400">{label}</p><strong className="mt-6 block text-4xl font-black dark:text-white">{value}</strong><small className="text-[#5b6300] dark:text-[#c7d400]">{note}</small></div><span className="grid h-10 w-10 place-items-center rounded bg-[#f2f1ef] dark:bg-[#3a3a3a] dark:text-neutral-200">{icon}</span></div></Card>;
}

export function Pill({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "acid" | "danger" | "dark" }) {
  return <span className={cx("inline-flex items-center rounded px-3 py-1 font-mono text-xs", tone === "soft" && "bg-[#efeeec] dark:bg-[#3a3a3a] dark:text-neutral-200", tone === "acid" && "bg-[#e7f600] text-black", tone === "danger" && "bg-[#ffe0dc] text-[#a80000]", tone === "dark" && "bg-[#07172b] text-white")}>{children}</span>;
}

function Progress({ value, tone = "dark" }: { value: number; tone?: "dark" | "acid" | "danger" }) {
  return <span className="block h-2 rounded bg-[#ecebea]"><span className={cx("block h-2 rounded", tone === "dark" && "bg-black", tone === "acid" && "bg-[#e7f600]", tone === "danger" && "bg-red-600")} style={{ width: `${value}%` }} /></span>;
}

export function DonutChart({ segments, centerLabel }: { segments: { label: string; value: number; color: string }[]; centerLabel: string }) {
  const size = 220;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#ecebea] dark:stroke-[#3a3a3a]" />
        {segments.map((seg) => {
          const fraction = seg.value / total;
          const dash = fraction * c;
          const rotation = (cumulative / total) * 360 - 90;
          cumulative += seg.value;
          return (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              style={{ stroke: seg.color }}
            />
          );
        })}
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className="fill-black text-4xl font-black dark:fill-white">
          {centerLabel}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Field({
  label,
  placeholder,
  className,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  className?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return <label className={cx("block", className)}><span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">{label}</span><input type={type} name={name} value={value} onChange={onChange} className="h-14 w-full border border-[#d5d7dd] bg-white px-5 text-lg outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100" placeholder={placeholder} /></label>;
}

function WorldMapMock() {
  return <div className="relative h-[430px] overflow-hidden rounded bg-[url('/images/world2.jpeg')] bg-cover bg-top"><div className="absolute left-8 top-8 rounded bg-white p-4 shadow"><strong className="block">Top Regions</strong><p>North America 42%</p><Progress value={42} /><p className="mt-2">European Union 28%</p><Progress value={28} /></div><span className="absolute left-[43%] top-[34%] h-5 w-5 rounded-full bg-black ring-4 ring-white" /><span className="absolute right-[24%] top-[42%] h-4 w-4 rounded-full bg-black ring-4 ring-white" /></div>;
}

function DataTable({ rows }: { rows: RecentActivityRow[] }) {
  if (rows.length === 0) {
    return <p className="text-neutral-500 dark:text-neutral-400">No leads found yet. Run a search from Lead Finder to see activity here.</p>;
  }
  return <div className="overflow-x-auto rounded border border-[#dfe2e7] dark:border-[#3a3a3a]"><table className="w-full min-w-[560px] text-left"><thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:bg-[#2e2e2e] dark:text-neutral-300"><tr><th className="p-4">Company</th><th>Country</th><th>Source</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#e5e5e5] dark:border-[#3a3a3a]" key={row.id}><td className="p-4"><strong className="dark:text-white">{row.company}</strong>{row.subtitle && <small className="block text-neutral-500 dark:text-neutral-400">{row.subtitle}</small>}</td><td className="dark:text-neutral-200">{row.country}</td><td><Pill>{row.source}</Pill></td><td><span className={row.status === "Contacted" ? "text-[#5b6300] dark:text-[#c7d400]" : "text-neutral-500 dark:text-neutral-400"}>● {row.status}</span></td><td><MoreVertical size={20} className="dark:text-neutral-400" /></td></tr>)}</tbody></table></div>;
}

function compactNumber(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

export function DashboardPage({ stats, recentActivity }: { stats: DashboardOverviewStats; recentActivity: RecentActivityRow[] }) {
  const { dictionary: t } = useLanguage();
  return <Page title={t.dashboardPage.title} subtitle={t.dashboardPage.subtitle}><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
    <Stat label={t.dashboardPage.totalLeadsFound} value={compactNumber(stats.totalLeadsFound.value)} note={<KpiDelta deltaPct={stats.totalLeadsFound.deltaPct} />} icon={<Users size={22} />} />
    <Stat label={t.dashboardPage.newLeadsToday} value={`+${stats.newLeadsToday.toLocaleString()}`} note="Since midnight" icon={<UserRound size={22} />} />
    <Stat label={t.dashboardPage.emailsSent} value={compactNumber(stats.emailsSent.value)} note={stats.emailsSent.deliverabilityPct !== null ? `${stats.emailsSent.deliverabilityPct.toFixed(1)}% deliverability` : "No emails sent yet"} icon={<Mail size={22} />} />
    <Stat label={t.dashboardPage.countriesReached} value={String(stats.countriesReached.value)} note={`${stats.countriesReached.activeLast30Days} active in the last 30 days`} icon={<Globe2 size={22} />} />
    <Stat label={t.dashboardPage.activeCampaigns} value={String(stats.activeCampaigns.value)} note={stats.activeCampaigns.value > 0 ? "Currently sending" : `${stats.activeCampaigns.completedLast30Days} completed in the last 30 days`} icon={<Zap size={22} />} />
  </div><Card className="mt-8" title={t.dashboardPage.globalLeadDistribution} subtitle={t.dashboardPage.globalLeadDistributionSubtitle}><WorldMapMock /></Card><Card className="mt-8" title={t.dashboardPage.recentActivity}><DataTable rows={recentActivity} /></Card></Page>;
}


export function LeadDetailPage() {
  const { dictionary: t } = useLanguage();
  return <Page title="TransGlobal Logistics" subtitle="Rotterdam, Netherlands · Logistics & Supply Chain · transglobal.nl" actions={<><Button tone="light">{t.leadDetailPage.addNote}</Button><Button>{t.leadDetailPage.saveLead}</Button></>}><div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]"><div className="space-y-8"><Card><div className="grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr]"><div className="grid h-40 place-items-center rounded border bg-[#f4f5f6]"><strong className="text-6xl">94</strong><small>{t.leadDetailPage.aiScore}</small></div><div><Pill tone="danger">{t.leadDetailPage.highPriority}</Pill><span className="ml-4 text-neutral-600">{t.leadDetailPage.lastUpdated}</span><p className="mt-5 text-lg">{t.leadDetailPage.summary}</p><div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2"><Progress value={78}/><Progress value={61}/></div></div></div></Card><Card title={t.leadDetailPage.companyProfile}><div className="grid grid-cols-1 gap-8 text-3xl font-black sm:grid-cols-3"><div><small className="block font-mono text-xs text-neutral-500">{t.leadDetailPage.annualRevenue}</small>$500M+</div><div><small className="block font-mono text-xs text-neutral-500">{t.leadDetailPage.employees}</small>2,400</div><div><small className="block font-mono text-xs text-neutral-500">{t.leadDetailPage.founded}</small>1998</div></div><div className="mt-8 flex gap-3"><Pill>SAP S/4HANA</Pill><Pill>AWS Cloud</Pill><Pill>Oracle DB</Pill><Pill>Salesforce</Pill></div></Card><Card title={t.leadDetailPage.activityTimeline}><Timeline /></Card></div><div className="space-y-8"><Card className="bg-[#07172b] text-white" title={t.leadDetailPage.aiPredictiveInsights}><Metric label={t.leadDetailPage.buyingProbability} value="88%" /><Metric label={t.leadDetailPage.importProbability} value="92%" /><p className="mt-8 text-slate-200">{t.leadDetailPage.predictiveNote}</p></Card><Card title={t.leadDetailPage.verifiedContacts}><Contact name="Marcus Hoffmann" role="Director of Global Trade" /><Contact name="Sophie van der Ley" role="Supply Chain Strategist" /><Button tone="light">{t.leadDetailPage.exportAllContacts}</Button></Card></div></div></Page>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="mt-5"><div className="flex justify-between"><span className="font-mono uppercase">{label}</span><strong className="text-3xl text-[#e7f600]">{value}</strong></div><Progress value={parseInt(value)} tone="acid" /></div>}
function Contact({name,role}:{name:string;role:string}){
  const { dictionary: t } = useLanguage();
  return <div className="mb-4 rounded border p-4"><strong>{name}</strong><p className="text-neutral-600">{role}</p><Pill tone="acid">{t.leadDetailPage.directEmailVerified}</Pill></div>;
}
function Timeline(){
  const { dictionary: t } = useLanguage();
  return <div className="space-y-7">{["Email Sent: Proposal for EU Expansion","New Intent Signal: Website Visit","Outgoing Call: No Answer"].map((text,i)=><div className="flex gap-4" key={text}><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef4ff] dark:bg-[#3a3a3a] dark:text-neutral-200">{i+1}</span><p><strong>{text}</strong><small className="block text-neutral-500">{t.leadDetailPage.timelineTracking}</small></p></div>)}</div>;
}

export type VisitorStats = { visitorsToday: number; identifiedCompanies: number; countries: number; returnVisitors: number };
export type VisitorRow = { organization: string | null; country: string | null; city: string | null; deviceType: string | null; lastVisit: string; visitCount: number };

export function VisitorPage({ stats, visitors, initialGeo }: { stats: VisitorStats; visitors: VisitorRow[]; initialGeo: GeoDistribution }) {
  const { dictionary: t } = useLanguage();
  return <Page title={t.visitorPage.title} subtitle={t.visitorPage.subtitle} actions={<><a href="/api/visitor-intelligence/export" className="inline-flex items-center gap-2 border border-[#d5d7dd] bg-white px-5 py-3 font-bold dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"><Download size={18} /> {t.visitorPage.exportData}</a></>}><div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"><Stat label={t.visitorPage.visitorsToday} value={stats.visitorsToday.toLocaleString()} note={t.visitorPage.last24Hours} icon={<Users/>}/><Stat label={t.visitorPage.identifiedCompanies} value={String(stats.identifiedCompanies)} note={t.visitorPage.withKnownOrg} icon={<Database/>}/><Stat label={t.visitorPage.countries} value={String(stats.countries)} note={t.visitorPage.globalReach} icon={<Globe2/>}/><Stat label={t.visitorPage.returnVisitors} value={String(stats.returnVisitors)} note={t.visitorPage.visitedMoreThanOnce} icon={<RefreshCw/>}/></div><Card className="mt-8"><GeographicDistribution initialData={initialGeo} /></Card><Card className="mt-8" title={t.visitorPage.identifiedCompanies}><VisitorTable rows={visitors} /></Card></Page>;
}

function VisitorTable({ rows }: { rows: VisitorRow[] }) {
  const { dictionary: t } = useLanguage();
  if (rows.length === 0) {
    return <p className="text-neutral-500">{t.visitorPage.emptyState}</p>;
  }
  return <div className="overflow-x-auto rounded border border-[#dfe2e7]"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600"><tr><th className="p-4">{t.visitorPage.tableCompany}</th><th>{t.visitorPage.tableCountry}</th><th>{t.visitorPage.tableCity}</th><th>{t.visitorPage.tableDevice}</th><th>{t.visitorPage.tableLastVisit}</th><th>{t.visitorPage.tableVisits}</th></tr></thead><tbody>{rows.map((row, i) => <tr className="border-t border-[#e5e5e5]" key={i}><td className="p-4"><strong>{row.organization ?? t.common.unknown}</strong></td><td>{row.country ?? "—"}</td><td>{row.city ?? "—"}</td><td>{row.deviceType ?? "—"}</td><td>{formatLastVisit(row.lastVisit, t)}</td><td>{row.visitCount}</td></tr>)}</tbody></table></div>;
}

function formatLastVisit(isoDate: string, t: Dictionary): string {
  const date = new Date(isoDate);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay(date, now)) return `${t.visitorPage.today}, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return `${t.visitorPage.yesterday}, ${time}`;
  return `${date.toLocaleDateString()}, ${time}`;
}

export function TradeDatabasesPage() {
  const { dictionary: t } = useLanguage();
  const { title, subtitle } = t.simplePages.trade;
  return (
    <Page title={title} subtitle={subtitle}>
      <Card>
        <div className="flex flex-col items-center py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f2f1ef] dark:bg-[#3a3a3a]">
            <Database className="text-neutral-500 dark:text-neutral-300" size={26} />
          </span>
          <h3 className="mt-6 text-2xl font-black dark:text-white">{t.tradeDatabasesBody.comingSoon}</h3>
          <p className="mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
            {t.tradeDatabasesBody.comingSoonText}
          </p>
        </div>
      </Card>
    </Page>
  );
}

export function SimplePage({ kind }: { kind: "image"|"trade"|"contact"|"email"|"templates"|"builder"|"sequences"|"reports"|"admin"|"settings" }) {
  const { dictionary: t } = useLanguage();
  const { title, subtitle } = t.simplePages[kind];
  const mockQueue: [string, string, string, string, string][] = [
    ["TransGlobal Logistics", "High fit account", "Germany", "Verified", "94"],
    ["Nordic Flow Oy", "Intent spike", "Finland", "Email", "88"],
    ["Apex Precision", "New market match", "UK", "Maps", "81"],
  ];
  return <Page title={title} subtitle={subtitle} actions={<Button>{kind === "reports" ? t.simplePageBody.exportPdf : t.simplePageBody.newButton}</Button>}><div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"><Card title={t.simplePageBody.overview}><p className="text-lg leading-8 text-neutral-600">{t.simplePageBody.overviewText}</p><div className="mt-8 grid gap-4"><Progress value={72} tone="acid"/><Progress value={54}/><Progress value={31} tone="danger"/></div></Card><Card title={t.simplePageBody.priorityQueue}><div className="overflow-x-auto rounded border border-[#dfe2e7]"><table className="w-full min-w-[560px] text-left"><thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600"><tr><th className="p-4">{t.simplePageBody.tableCompany}</th><th>{t.simplePageBody.tableSignal}</th><th>{t.simplePageBody.tableCountry}</th><th>{t.simplePageBody.tableChannel}</th><th>{t.simplePageBody.tableScore}</th></tr></thead><tbody>{mockQueue.map((row) => <tr className="border-t border-[#e5e5e5]" key={row[0]}><td className="p-4"><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td><Pill>{row[3]}</Pill></td><td>{row[4]}</td></tr>)}</tbody></table></div></Card><Card title={t.simplePageBody.aiAssistant}><Sparkles className="mb-4 text-[#d8e400]" size={36}/><h3 className="text-2xl font-black">{t.simplePageBody.recommendedAction}</h3><p className="mt-3 text-neutral-600">{t.simplePageBody.recommendedActionText}</p><Button tone="acid">{t.simplePageBody.applyRecommendation}</Button></Card></div></Page>;
}
