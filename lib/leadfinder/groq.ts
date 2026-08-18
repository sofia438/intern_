import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";
const VISION_MODEL = process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview";

export async function describeImage(dataUrl: string): Promise<string | null> {
  try {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this product in 1-2 short sentences: what it is, its likely category, and any visible part/model identifiers. Be concise.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function generateKeywords(input: {
  productName: string;
  oemNumber?: string | null;
  hsCode?: string | null;
  imageDescription?: string | null;
  countryName: string;
}): Promise<string[]> {
  const fallback = [`${input.productName} ${input.countryName}`];

  try {
    const prompt = `You are helping find companies that import, distribute, or manufacture a specific product in a target country, for a B2B export lead generation tool.

Product name: ${input.productName}
${input.oemNumber ? `OEM/part number: ${input.oemNumber}\n` : ""}${input.hsCode ? `HS code: ${input.hsCode}\n` : ""}${input.imageDescription ? `Additional context from a product photo: ${input.imageDescription}\n` : ""}Target country: ${input.countryName}

Generate 4 diverse, realistic search engine queries (in English) that would surface companies (importers, distributors, wholesalers, manufacturers) dealing in this product in the target country. Vary the phrasing and business terms used (e.g. "distributor", "supplier", "wholesaler", "importer"). Do not include consumer-shopping phrasing.

Respond with a JSON object: {"keywords": ["...", "...", "...", "..."]}`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.keywords)) {
      const keywords = parsed.keywords.filter((k: unknown): k is string => typeof k === "string" && k.trim().length > 0);
      if (keywords.length > 0) return keywords.slice(0, 5);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function suggestRelatedIndustries(input: {
  productName: string;
  oemNumber?: string | null;
  hsCode?: string | null;
  imageDescription?: string | null;
}): Promise<string[]> {
  try {
    const prompt = `You are helping a B2B export lead generation tool broaden its search beyond a single product.

Product name: ${input.productName}
${input.oemNumber ? `OEM/part number: ${input.oemNumber}\n` : ""}${input.hsCode ? `HS code: ${input.hsCode}\n` : ""}${input.imageDescription ? `Additional context from a product photo: ${input.imageDescription}\n` : ""}
Suggest 4-6 related industries or business sectors that might buy or use this product even if they don't specialize in it (e.g. for "Brake Pad": Automotive Parts, Car Repair Shops, Vehicle Maintenance, Fleet Suppliers). Keep each entry short (2-4 words).

Respond with a JSON object: {"industries": ["...", "...", "...", "..."]}`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.industries)) return [];

    return parsed.industries
      .filter((i: unknown): i is string => typeof i === "string" && i.trim().length > 0)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateMapsKeywords(input: {
  productName: string;
  industry?: string | null;
  countryName: string;
}): Promise<string[]> {
  const fallback = [[input.industry, input.productName].filter(Boolean).join(" ")];

  try {
    const prompt = `You are helping a lead-generation tool search Google Maps for local businesses related to a product, in a target country.

Product name: ${input.productName}
${input.industry ? `Industry: ${input.industry}\n` : ""}Target country: ${input.countryName}

Generate 4-6 short, realistic local-business search phrases someone would type into Google Maps to find businesses related to this product or industry (e.g. for "Brake Pad" in the automotive industry: "automotive", "automotive spare parts", "engine", "vehicle parts", "car components", "OEM supplier"). Keep each phrase 1-3 words, phrased like a Maps search, not a web search.

Respond with a JSON object: {"keywords": ["...", "...", "...", "..."]}`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 250,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.keywords)) {
      const keywords = parsed.keywords.filter((k: unknown): k is string => typeof k === "string" && k.trim().length > 0);
      if (keywords.length > 0) return keywords.slice(0, 6);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function translateProductName(productName: string, language: string): Promise<string | null> {
  if (language === "English") return null;

  try {
    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "user",
          content: `Translate the following product name into ${language}. Respond with ONLY the translated term, no explanation, no quotes.\n\nProduct: ${productName}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function extractContactsFromPage(
  pageText: string,
  emails: string[]
): Promise<{ email: string; name: string | null; title: string | null }[]> {
  const fallback = emails.map((email) => ({ email, name: null, title: null }));
  if (emails.length === 0) return [];

  try {
    const prompt = `You are extracting contact information from a company webpage for a B2B sales tool.

Here are email addresses found on this page:
${emails.join(", ")}

Here is the page's visible text (truncated):
${pageText.slice(0, 3000)}

For each email above, identify a person's full name and job title if one is mentioned near it on the page (e.g. "John Smith, Purchasing Manager"). If no name/title is associated with an email, use null for both.

Respond with a JSON object: {"contacts": [{"email": "...", "name": "..." or null, "title": "..." or null}]} covering every email listed above.`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.contacts)) return fallback;

    const byEmail = new Map<string, { name: string | null; title: string | null }>();
    for (const entry of parsed.contacts) {
      if (typeof entry?.email === "string") {
        byEmail.set(entry.email.toLowerCase(), {
          name: typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : null,
          title: typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : null,
        });
      }
    }

    return emails.map((email) => {
      const match = byEmail.get(email.toLowerCase());
      return { email, name: match?.name ?? null, title: match?.title ?? null };
    });
  } catch {
    return fallback;
  }
}

export async function generateMessageVariants(baseMessage: string): Promise<string[]> {
  const fallback = [baseMessage];

  try {
    const prompt = `You are helping a B2B sales team avoid spam filters when sending the same introduction email to many companies. Rewrite the message below into 5 variants that preserve the exact same meaning, tone, and any {{name}} / {{company}} placeholders (keep them exactly as-is, do not translate or remove them), but vary the phrasing/sentence structure enough that the emails don't look byte-for-byte identical.

Original message:
${baseMessage}

Respond with a JSON object: {"variants": ["...", "...", "...", "...", "..."]}`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.variants)) {
      const variants = parsed.variants.filter(
        (v: unknown): v is string => typeof v === "string" && v.trim().length > 0
      );
      if (variants.length > 0) return variants.slice(0, 5);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function scoreCandidates(
  candidates: { title: string; link: string; snippet: string }[],
  productContext: string
): Promise<Record<string, number>> {
  if (candidates.length === 0) return {};

  try {
    const list = candidates
      .map((c, i) => `${i}. Title: ${c.title}\nURL: ${c.link}\nSnippet: ${c.snippet}`)
      .join("\n\n");

    const prompt = `You are scoring search results for relevance to a B2B export lead search.

Product context: ${productContext}

For each numbered search result below, give a confidence score from 0 to 100 for how likely this is a real company website (importer, distributor, manufacturer, wholesaler) relevant to the product context — NOT a marketplace listing, forum, news article, or unrelated business.

${list}

Respond with a JSON object: {"scores": [{"index": 0, "score": 85}, {"index": 1, "score": 20}]} covering every index.`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const result: Record<string, number> = {};

    if (Array.isArray(parsed.scores)) {
      for (const entry of parsed.scores) {
        const idx = entry?.index;
        const score = entry?.score;
        if (typeof idx === "number" && typeof score === "number" && candidates[idx]) {
          result[candidates[idx].link] = Math.max(0, Math.min(100, score));
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}
