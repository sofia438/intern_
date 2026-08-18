import * as cheerio from "cheerio";

import { extractContactsFromPage } from "@/lib/leadfinder/groq";
import { mapWithConcurrency } from "@/lib/leadfinder/scrape";

const USER_AGENT = "Mozilla/5.0 (compatible; GlobalExpoBot/1.0; +https://globalexpo.example/bot)";
const PAGE_TIMEOUT_MS = 8000;
const MAX_CANDIDATE_PAGES = 5;
const PAGE_CONCURRENCY = 3;

const CONTACT_PAGE_KEYWORDS = [
  "contact",
  "about",
  "team",
  "management",
  "leadership",
  "purchasing",
  "procurement",
  "sales",
  "export",
  "import",
  "staff",
  "employee",
  "people",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SINGLE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export function discoverCandidatePages(homepageHtml: string, baseUrl: string): string[] {
  try {
    const $ = cheerio.load(homepageHtml);
    const matched = new Set<string>();
    const baseOrigin = new URL(baseUrl).origin;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const text = $(el).text().toLowerCase();
      const hrefLower = href.toLowerCase();
      const isMatch = CONTACT_PAGE_KEYWORDS.some((kw) => hrefLower.includes(kw) || text.includes(kw));
      if (!isMatch) return;

      try {
        const resolved = new URL(href, baseUrl);
        if (resolved.origin === baseOrigin) {
          matched.add(resolved.toString());
        }
      } catch {
        // ignore unresolvable hrefs (mailto:, tel:, javascript:, etc.)
      }
    });

    return Array.from(matched).slice(0, MAX_CANDIDATE_PAGES);
  } catch {
    return [];
  }
}

function collectEmailsFromJson(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (SINGLE_EMAIL_REGEX.test(value)) out.add(value.toLowerCase());
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectEmailsFromJson(v, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectEmailsFromJson(v, out);
  }
}

// cheerio's plain `.text()` concatenates every descendant text node with NO
// separator, so visually-adjacent-but-unrelated fragments (a phone number
// right before an email, a nav link butting up against a heading) fuse into
// one string — e.g. "+8613902449019info@company.com" or
// "LoginContactsinfo@company.com". Walking text nodes individually and
// joining with an explicit space avoids that, instead of chasing every
// possible concatenation pattern with regex patches.
function getSpacedText($: cheerio.CheerioAPI, root: string): string {
  const parts: string[] = [];
  $(root)
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === "text") {
        const text = (node.data ?? "").trim();
        if (text) parts.push(text);
      }
    });
  return parts.join(" ");
}

// Extra safety net: a phone number and email can still end up in the same
// text node in rare cases (e.g. "Tel: +86...  info@x.com" with just a
// space) — strip a leading digit run immediately followed by a letter,
// since real email local-parts never start that way.
function cleanEmailMatch(raw: string): string {
  return raw.replace(/^\+?\d{5,}(?=[a-zA-Z])/, "");
}

export function extractEmailsFromPage(html: string): string[] {
  try {
    const $ = cheerio.load(html);
    const emails = new Set<string>();

    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const email = href.replace(/^mailto:/i, "").split("?")[0].trim();
      if (email) emails.add(email.toLowerCase());
    });

    const bodyMatches = getSpacedText($, "body").match(EMAIL_REGEX) ?? [];
    for (const m of bodyMatches) emails.add(cleanEmailMatch(m).toLowerCase());

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        collectEmailsFromJson(JSON.parse($(el).text()), emails);
      } catch {
        // ignore malformed JSON-LD
      }
    });

    return Array.from(emails);
  } catch {
    return [];
  }
}

function getPageText(html: string): string {
  try {
    const $ = cheerio.load(html);
    return getSpacedText($, "body").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

type Tier = 1 | 2 | 3 | 4;

const TIER_PATTERNS: { pattern: RegExp; tier: Tier }[] = [
  { pattern: /^(purchasing|procurement|buyer|buying|sourcing)/i, tier: 1 },
  { pattern: /^(export|sales|international|manager|director)/i, tier: 2 },
  { pattern: /^(ceo|owner|founder|president)/i, tier: 3 },
  { pattern: /^(info|contact|support|office|admin|hello|enquir)/i, tier: 4 },
];

const TIER_CONFIDENCE: Record<Tier, number> = { 1: 95, 2: 80, 3: 55, 4: 25 };

// Deterministic, no AI: scores an email by its local-part against the spec's
// priority tiers. Anything unrecognized (e.g. "john@") defaults to tier 3
// rather than the lowest tier — it might be a real named person's address,
// which the spec itself treats as more valuable than a generic mailbox.
export function rankEmail(email: string, hasName: boolean): { tier: Tier; confidence: number } {
  const local = email.split("@")[0] ?? "";
  let tier: Tier = 3;

  for (const { pattern, tier: t } of TIER_PATTERNS) {
    if (pattern.test(local)) {
      tier = t;
      break;
    }
  }

  let confidence = TIER_CONFIDENCE[tier];
  if (hasName) {
    confidence = Math.min(99, confidence + 10);
    if (tier === 4) tier = 2;
  }

  return { tier, confidence };
}

export type CompanyContact = {
  email: string;
  name: string | null;
  title: string | null;
  sourcePage: string;
  confidence: number;
};

export async function findCompanyContact(website: string): Promise<CompanyContact | null> {
  try {
    const homepageHtml = await fetchPage(website);
    if (!homepageHtml) return null;

    const candidatePages = discoverCandidatePages(homepageHtml, website);

    const fetchedPages = await mapWithConcurrency(candidatePages, PAGE_CONCURRENCY, async (url) => {
      const html = await fetchPage(url);
      return html ? { url, html } : null;
    });

    const pagesToVisit = [{ url: website, html: homepageHtml }, ...fetchedPages.filter((p) => p !== null)];

    const found = new Map<string, { name: string | null; title: string | null; sourcePage: string }>();

    for (const page of pagesToVisit) {
      const emails = extractEmailsFromPage(page.html);
      if (emails.length === 0) continue;

      const pageText = getPageText(page.html);
      const contacts = await extractContactsFromPage(pageText, emails);

      for (const contact of contacts) {
        if (!found.has(contact.email)) {
          found.set(contact.email, { name: contact.name, title: contact.title, sourcePage: page.url });
        }
      }
    }

    if (found.size === 0) return null;

    const scored = Array.from(found.entries()).map(([email, info]) => {
      const { tier, confidence } = rankEmail(email, !!info.name);
      return { email, ...info, tier, confidence };
    });

    scored.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      if (!!a.name !== !!b.name) return a.name ? -1 : 1;
      return b.confidence - a.confidence;
    });

    const winner = scored[0];
    return {
      email: winner.email,
      name: winner.name,
      title: winner.title,
      sourcePage: winner.sourcePage,
      confidence: winner.confidence,
    };
  } catch {
    return null;
  }
}
