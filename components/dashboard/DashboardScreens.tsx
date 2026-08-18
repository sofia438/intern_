"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  Database,
  Download,
  Eye,
  Gauge,
  Globe2,
  Grid2X2,
  Image as ImageIcon,
  LogOut,
  Mail,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { logout } from "@/app/actions/auth";
import LocationPromptModal from "@/components/dashboard/LocationPromptModal";
import ThemeToggle from "@/components/dashboard/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { label: "Visitor Intelligence", href: "/visitor-intelligence", icon: Eye },
  { label: "Lead Finder", href: "/lead-finder", icon: Search },
  { label: "Image Search", href: "/image-search", icon: ImageIcon },
  { label: "Trade Databases", href: "/trade-databases", icon: Database },
  { label: "Contact Finder", href: "/contact-finder", icon: Users },
  { label: "Email Campaigns", href: "/email-campaigns", icon: Mail },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Billing", href: "/billing", icon: ShieldCheck },
  { label: "Admin", href: "/admin", icon: Gauge },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserRound },
];

const leads = [
  ["Mekong Textiles", "Apparel & Fashion", "Vietnam", "Trade DB", "Verified"],
  ["Global Solars", "Renewable Energy", "Germany", "LinkedIn", "Contacted"],
  ["Nordic AgriCo", "Agriculture", "Norway", "Trade DB", "Verified"],
  ["Inca Ore Ltd.", "Mining", "Peru", "Maps Search", "Flagged"],
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DashboardUser = { name: string; email: string; role: string; companyName: string; needsLocationPrompt: boolean } | null;

export function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const pathname = usePathname();
  const initials = user
    ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[#f8f7f6] text-[#050b1d] dark:bg-[#1a1a1a] dark:text-neutral-100">
      <aside className="fixed left-0 top-0 z-20 flex h-screen w-[300px] flex-col border-r border-[#d8d8d8] bg-white dark:border-[#3a3a3a] dark:bg-[#242424]">
        <Link href="/dashboard" className="flex items-center gap-4 px-8 py-8">
          <Image src="/images/logo.png" alt="GlobalExpo Logo" width={48} height={48} className="object-contain" />
          <span className="leading-tight">
            <strong className="block text-2xl font-black tracking-tight">GlobalExpo</strong>
            <small className="font-mono text-sm uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">Enterprise Tier</small>
          </span>
        </Link>

        <nav className="mt-4 flex-1 space-y-1 px-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-4 px-5 py-3 text-lg transition",
                  active
                    ? "border-r-2 border-black bg-[#f0efed] font-bold text-black dark:border-white dark:bg-[#3a3a3a] dark:text-white"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-[#3a3a3a]"
                )}
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#d8d8d8] p-5 dark:border-[#3a3a3a]">
          <Link href="/lead-finder" className="flex items-center justify-center gap-3 bg-[#e7f600] px-5 py-4 font-black uppercase tracking-[0.12em] text-black">
            <Zap size={22} /> Generate Leads
          </Link>
          <div className="mt-6 grid gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/reports">Help Center</Link>
            <Link href="/settings">Contact Support</Link>
          </div>
        </div>
      </aside>

      <div className="pl-[300px]">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#d8d8d8] bg-white/95 px-8 backdrop-blur dark:border-[#3a3a3a] dark:bg-[#242424]/95">
          <label className="flex h-12 w-[520px] items-center gap-3 rounded border border-[#d5d7dd] bg-[#f4f2f2] px-4 text-neutral-500 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-400">
            <Search size={22} />
            <input className="w-full bg-transparent outline-none" placeholder="Search leads, databases, or companies..." />
          </label>
          <div className="flex items-center gap-5">
            <Link className="font-mono text-sm" href="/trade-databases">Marketplace</Link>
            <Link className="font-mono text-sm" href="/reports">Documentation</Link>
            <Bell size={23} />
            <ThemeToggle />
            <Link href="/billing" className="rounded-full bg-[#f3efe3] px-5 py-3 font-mono text-sm transition hover:bg-[#ece5d1] dark:bg-[#3a3a3a] dark:text-neutral-200 dark:hover:bg-[#454545]">Enterprise Plan</Link>
            <div className="flex items-center gap-3 border-l pl-5 dark:border-[#3a3a3a]">
              <Link href="/profile" className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dfe5ec] font-bold dark:bg-[#3a3a3a] dark:text-white">{initials}</span>
                <span className="hidden xl:block leading-tight">
                  <strong>{user?.name ?? "Guest"}</strong>
                  <small className="block uppercase text-neutral-500 dark:text-neutral-400">{user?.role ?? ""}</small>
                </span>
              </Link>
              <form action={logout}>
                <button type="submit" title="Log out" className="text-neutral-500 transition hover:text-black dark:text-neutral-400 dark:hover:text-white">
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
  return <main className="p-8"><div className="mb-8 flex items-start justify-between gap-5"><div><h1 className="text-5xl font-black tracking-tight">{title}</h1>{subtitle ? <p className="mt-2 text-xl text-neutral-600">{subtitle}</p> : null}</div>{actions ? <div className="flex gap-3">{actions}</div> : null}</div>{children}</main>;
}

export function Button({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" | "acid" }) {
  return <button className={cx("inline-flex items-center gap-2 border px-5 py-3 font-bold", tone === "dark" && "border-[#07172b] bg-[#07172b] text-white", tone === "light" && "border-[#d5d7dd] bg-white dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100", tone === "acid" && "border-[#e7f600] bg-[#e7f600] text-black")}>{children}</button>;
}

export function Card({ title, subtitle, children, className }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={cx("rounded-md border border-[#dfe2e7] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#242424]", className)}>{title ? <div className="border-b border-[#ececec] p-7 dark:border-[#3a3a3a]"><h2 className="text-3xl font-black dark:text-white">{title}</h2>{subtitle ? <p className="mt-1 text-neutral-600 dark:text-neutral-400">{subtitle}</p> : null}</div> : null}<div className="p-7">{children}</div></section>;
}

function Stat({ label, value, note, icon }: { label: string; value: string; note: string; icon: React.ReactNode }) {
  return <Card className="min-h-[145px]"><div className="flex justify-between"><div><p className="text-neutral-600">{label}</p><strong className="mt-6 block text-4xl font-black">{value}</strong><small className="text-[#5b6300]">{note}</small></div><span className="grid h-10 w-10 place-items-center rounded bg-[#f2f1ef] dark:bg-[#3a3a3a] dark:text-neutral-200">{icon}</span></div></Card>;
}

export function Pill({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "acid" | "danger" | "dark" }) {
  return <span className={cx("inline-flex items-center rounded px-3 py-1 font-mono text-xs", tone === "soft" && "bg-[#efeeec] dark:bg-[#3a3a3a] dark:text-neutral-200", tone === "acid" && "bg-[#e7f600] text-black", tone === "danger" && "bg-[#ffe0dc] text-[#a80000]", tone === "dark" && "bg-[#07172b] text-white")}>{children}</span>;
}

function Progress({ value, tone = "dark" }: { value: number; tone?: "dark" | "acid" | "danger" }) {
  return <span className="block h-2 rounded bg-[#ecebea]"><span className={cx("block h-2 rounded", tone === "dark" && "bg-black", tone === "acid" && "bg-[#e7f600]", tone === "danger" && "bg-red-600")} style={{ width: `${value}%` }} /></span>;
}

function DonutChart({ segments, centerLabel }: { segments: { label: string; value: number; color: string }[]; centerLabel: string }) {
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

function DataTable({ rows = leads }: { rows?: string[][] }) {
  return <div className="overflow-hidden rounded border border-[#dfe2e7]"><table className="w-full text-left"><thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600"><tr><th className="p-4">Company</th><th>Country</th><th>Source</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#e5e5e5]" key={row[0]}><td className="p-4"><strong>{row[0]}</strong><small className="block text-neutral-500">{row[1]}</small></td><td>{row[2]}</td><td><Pill>{row[3]}</Pill></td><td><span className={row[4] === "Flagged" ? "text-red-600" : "text-[#5b6300]"}>● {row[4]}</span></td><td><MoreVertical size={20} /></td></tr>)}</tbody></table></div>;
}

export function DashboardPage() {
  return <Page title="Dashboard Overview" subtitle="Global export lead metrics and real-time intelligence for the last 30 days." actions={<><Button tone="light"><Calendar size={18} /> Last 30 Days</Button><Button><Download size={18} /> Export Report</Button></>}><div className="grid grid-cols-5 gap-5"><Stat label="Total Leads Found" value="154.2k" note="+8.2% vs last month" icon={<Users size={22} />} /><Stat label="New Leads Today" value="+1,240" note="Updated 2m ago" icon={<UserRound size={22} />} /><Stat label="Emails Sent" value="85.6k" note="98.4% deliverability" icon={<Mail size={22} />} /><Stat label="Countries Reached" value="42" note="Expanding in APAC" icon={<Globe2 size={22} />} /><Stat label="Active Campaigns" value="12" note="4 performing above avg" icon={<Zap size={22} />} /></div><div className="mt-8 grid grid-cols-[2fr_1fr] gap-8"><Card title="Global Lead Distribution" subtitle="Real-time visualization of lead intensity and connection routes."><WorldMapMock /></Card><Card title="Leads by Industry" subtitle="Distribution across primary sectors.">{[["Manufacturing",90,"45k"],["Technology",60,"32k"],["Agriculture",45,"24k"],["Energy",35,"18k"],["Logistics",22,"12k"]].map(([n,v,c]) => <div className="mb-7" key={n as string}><div className="mb-2 flex justify-between"><span>{n}</span><strong>{c}</strong></div><Progress value={v as number} /></div>)}<strong>View all industries →</strong></Card></div><div className="mt-8 grid grid-cols-[2fr_1fr] gap-8"><Card title="Recent Activity"><DataTable /></Card><div className="flex flex-col gap-8"><Card title="Monthly Growth" subtitle="Lead acquisition trend analysis."><div className="flex h-[220px] items-end gap-3 border-b pb-8 dark:border-[#3a3a3a]">{[35,48,74,92].map((h,i)=><div className="flex-1" key={h}><div className="rounded-t bg-black dark:bg-white" style={{height:h*1.6}} /><strong className="mt-3 block text-center text-sm">{["8.4k","10.1k","12.5k","14.2k"][i]}</strong></div>)}</div></Card><Card title="Performance Overview" subtitle="Key metrics at a glance."><DonutChart centerLabel="70%" segments={[{label:"Deliverability",value:98,color:"#2563eb"},{label:"Campaign Completion",value:82,color:"#1e3a8a"},{label:"Plan Usage",value:67,color:"#60a5fa"},{label:"Conversion Rate",value:34,color:"#93c5fd"}]} /></Card></div></div></Page>;
}


export function LeadDetailPage() { return <Page title="TransGlobal Logistics" subtitle="Rotterdam, Netherlands · Logistics & Supply Chain · transglobal.nl" actions={<><Button tone="light">Add Note</Button><Button>Save Lead</Button></>}><div className="grid grid-cols-[2fr_1fr] gap-8"><div className="space-y-8"><Card><div className="grid grid-cols-[180px_1fr] gap-8"><div className="grid h-40 place-items-center rounded border bg-[#f4f5f6]"><strong className="text-6xl">94</strong><small>AI Score</small></div><div><Pill tone="danger">High Priority</Pill><span className="ml-4 text-neutral-600">Last updated: 2 hours ago</span><p className="mt-5 text-lg">TransGlobal Logistics has shown a 45% increase in cross-border trade queries in the last 30 days. Their tech stack and revenue growth suggest high readiness.</p><div className="mt-6 grid grid-cols-2 gap-8"><Progress value={78}/><Progress value={61}/></div></div></div></Card><Card title="Company Profile"><div className="grid grid-cols-3 gap-8 text-3xl font-black"><div><small className="block font-mono text-xs text-neutral-500">Annual Revenue</small>$500M+</div><div><small className="block font-mono text-xs text-neutral-500">Employees</small>2,400</div><div><small className="block font-mono text-xs text-neutral-500">Founded</small>1998</div></div><div className="mt-8 flex gap-3"><Pill>SAP S/4HANA</Pill><Pill>AWS Cloud</Pill><Pill>Oracle DB</Pill><Pill>Salesforce</Pill></div></Card><Card title="Activity Timeline"><Timeline /></Card></div><div className="space-y-8"><Card className="bg-[#07172b] text-white" title="AI Predictive Insights"><Metric label="Buying Probability" value="88%" /><Metric label="Import Probability" value="92%" /><p className="mt-8 text-slate-200">Operations mirror Maersk and DHL Logistics hubs in Northern Europe.</p></Card><Card title="Verified Contacts"><Contact name="Marcus Hoffmann" role="Director of Global Trade" /><Contact name="Sophie van der Ley" role="Supply Chain Strategist" /><Button tone="light">Export All Contacts</Button></Card></div></div></Page> }
function Metric({label,value}:{label:string;value:string}){return <div className="mt-5"><div className="flex justify-between"><span className="font-mono uppercase">{label}</span><strong className="text-3xl text-[#e7f600]">{value}</strong></div><Progress value={parseInt(value)} tone="acid" /></div>}
function Contact({name,role}:{name:string;role:string}){return <div className="mb-4 rounded border p-4"><strong>{name}</strong><p className="text-neutral-600">{role}</p><Pill tone="acid">Direct Email Verified</Pill></div>}
function Timeline(){return <div className="space-y-7">{["Email Sent: Proposal for EU Expansion","New Intent Signal: Website Visit","Outgoing Call: No Answer"].map((t,i)=><div className="flex gap-4" key={t}><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef4ff] dark:bg-[#3a3a3a] dark:text-neutral-200">{i+1}</span><p><strong>{t}</strong><small className="block text-neutral-500">AI automated tracking · Oct 24</small></p></div>)}</div>}

export type VisitorStats = { visitorsToday: number; identifiedCompanies: number; countries: number; returnVisitors: number };
export type VisitorRow = { organization: string | null; country: string | null; city: string | null; deviceType: string | null; lastVisit: string; visitCount: number };

export function VisitorPage({ stats, visitors }: { stats: VisitorStats; visitors: VisitorRow[] }) { return <Page title="Visitor Intelligence" subtitle="Real-time identification and intent tracking of global business visitors." actions={<><Button tone="light">Export Data</Button><Button tone="acid">Smart Filter</Button></>}><div className="grid grid-cols-4 gap-8"><Stat label="Visitors Today" value={stats.visitorsToday.toLocaleString()} note="Last 24 hours" icon={<Users/>}/><Stat label="Identified Companies" value={String(stats.identifiedCompanies)} note="With known organization" icon={<Database/>}/><Stat label="Countries" value={String(stats.countries)} note="Global reach" icon={<Globe2/>}/><Stat label="Return Visitors" value={String(stats.returnVisitors)} note="Visited more than once" icon={<RefreshCw/>}/></div><div className="mt-8 grid grid-cols-[2fr_1fr] gap-8"><div><Card title="Visitor Activity Map"><WorldMapMock /></Card><Card className="mt-8" title="Visitor Journey Timeline"><div className="flex justify-around py-10 text-center"><Step icon={<Grid2X2/>} label="Home"/><Step icon={<Database/>} label="Pricing"/><Step icon={<Sparkles/>} label="API Docs" active/></div></Card></div><Card className="bg-[#07172b] text-white" title="AI Smart Recommendations">{["Nordic Flow Oy","TransGlobal Log","Maersk Regional"].map((n,i)=><div className="mb-5 rounded bg-white/10 p-5" key={n}><strong>{n}</strong><Pill tone={i===0?"danger":"acid"}>{i===0?"Contact Immediately":"High Intent"}</Pill><p className="mt-3 text-slate-200">High intent detected. Pricing page viewed repeatedly.</p></div>)}</Card></div><Card className="mt-8" title="Identified Companies"><VisitorTable rows={visitors} /></Card></Page> }

function VisitorTable({ rows }: { rows: VisitorRow[] }) {
  if (rows.length === 0) {
    return <p className="text-neutral-500">No visitors identified yet. Embed your tracking script from Settings to start collecting data.</p>;
  }
  return <div className="overflow-hidden rounded border border-[#dfe2e7]"><table className="w-full text-left"><thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600"><tr><th className="p-4">Company</th><th>Country</th><th>City</th><th>Device</th><th>Last Visit</th><th>Visits</th></tr></thead><tbody>{rows.map((row, i) => <tr className="border-t border-[#e5e5e5]" key={i}><td className="p-4"><strong>{row.organization ?? "Unknown"}</strong></td><td>{row.country ?? "—"}</td><td>{row.city ?? "—"}</td><td>{row.deviceType ?? "—"}</td><td>{formatLastVisit(row.lastVisit)}</td><td>{row.visitCount}</td></tr>)}</tbody></table></div>;
}

function formatLastVisit(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay(date, now)) return `Today, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString()}, ${time}`;
}
function Step({icon,label,active}:{icon:React.ReactNode;label:string;active?:boolean}){return <div><span className={cx("mx-auto grid h-16 w-16 place-items-center rounded-xl border-2 dark:border-[#3a3a3a]",active&&"bg-[#e7f600] text-black")}>{icon}</span><strong className="mt-3 block">{label}</strong><small>09:{active?"51":"42"} AM</small></div>}

export function SimplePage({ kind }: { kind: "image"|"trade"|"contact"|"email"|"templates"|"builder"|"sequences"|"reports"|"admin"|"settings" }) {
  const map = { image: ["Image Search", "Find visual matches, product photos, and supplier signals from product images."], trade: ["Trade Databases", "Browse verified import/export datasets and customs intelligence."], contact: ["Contact Finder", "Discover verified decision makers and direct outreach channels."], email: ["Email Campaigns", "Create, launch, and measure export sales campaigns."], templates: ["Template Gallery", "Reusable outreach templates by region and industry."], builder: ["Campaign Builder", "Build a personalized campaign for selected leads."], sequences: ["Sequences", "Automated follow-up flows for export prospecting."], reports: ["Reports", "Export performance, lead quality, and campaign analytics."], admin: ["Admin", "User management, activity controls, and account governance."], settings: ["Settings", "Workspace preferences, integrations, security, and profile."] } as const;
  const [title, subtitle] = map[kind];
  return <Page title={title} subtitle={subtitle} actions={<Button>{kind === "reports" ? "Export PDF" : "New"}</Button>}><div className="grid grid-cols-3 gap-8"><Card title="Overview"><p className="text-lg leading-8 text-neutral-600">This screen follows the same GlobalExport AI system: sharp cards, monospace labels, black primary actions, and acid yellow AI states.</p><div className="mt-8 grid gap-4"><Progress value={72} tone="acid"/><Progress value={54}/><Progress value={31} tone="danger"/></div></Card><Card title="Priority Queue"><DataTable rows={[["TransGlobal Logistics","High fit account","Germany","Verified","94"],["Nordic Flow Oy","Intent spike","Finland","Email","88"],["Apex Precision","New market match","UK","Maps","81"]]} /></Card><Card title="AI Assistant"><Sparkles className="mb-4 text-[#d8e400]" size={36}/><h3 className="text-2xl font-black">Recommended next action</h3><p className="mt-3 text-neutral-600">Prioritize companies with recent buyer intent and matching HS-code demand.</p><Button tone="acid">Apply Recommendation</Button></Card></div></Page>;
}
