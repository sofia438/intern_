import * as cheerio from "cheerio";

export type ScrapedContact = {
  companyName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d[\d\s().-]{7,}\d)/;

export async function scrapeWebsite(url: string): Promise<ScrapedContact> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GlobalExpoBot/1.0; +https://globalexpo.example/bot)",
      },
    });

    if (!response.ok) {
      return { companyName: null, email: null, phone: null, address: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const companyName =
      $('meta[property="og:site_name"]').attr("content")?.trim() ||
      $("title").text().trim().split(/[|\-–]/)[0]?.trim() ||
      null;

    let email: string | null = null;
    const mailtoHref = $('a[href^="mailto:"]').first().attr("href");
    if (mailtoHref) {
      email = mailtoHref.replace(/^mailto:/i, "").split("?")[0].trim();
    } else {
      const bodyText = $("body").text();
      const match = bodyText.match(EMAIL_REGEX);
      email = match ? match[0] : null;
    }

    let phone: string | null = null;
    const telHref = $('a[href^="tel:"]').first().attr("href");
    if (telHref) {
      phone = telHref.replace(/^tel:/i, "").trim();
    } else {
      const bodyText = $("body").text();
      const match = bodyText.match(PHONE_REGEX);
      phone = match ? match[0].trim() : null;
    }

    
    const address = $('[itemprop="address"]').first().text().trim() || null;

    return { companyName, email, phone, address };
  } catch {
    return { companyName: null, email: null, phone: null, address: null };
  }
}

export async function scrapePageText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GlobalExpoBot/1.0; +https://globalexpo.example/bot)",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();

    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const combined = [title, metaDescription, bodyText].filter(Boolean).join("\n");
    return combined.length > 0 ? combined.slice(0, 4000) : null;
  } catch {
    return null;
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await fn(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
