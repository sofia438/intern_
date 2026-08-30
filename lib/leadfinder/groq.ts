import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";
const VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";

export type ImageIdentification = {
  product: string;
  category: string;
  partNumber: string | null;
  brand: string | null;
};

export async function identifyImage(dataUrl: string): Promise<ImageIdentification | null> {
  try {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Identify the product in this image for a B2B export lead generation tool. Respond ONLY with a JSON object in this exact shape:
{"product": "short product name", "category": "short category", "partNumber": "visible part/model number or null", "brand": "visible brand/logo or null"}
Always provide your best guess for "product" and "category". Use null for "partNumber"/"brand" if none is visible. Be concise.`,
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      // The vision model (qwen/qwen3.6-27b) 
      
      reasoning_format: "hidden",
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed.product !== "string" || typeof parsed.category !== "string") return null;

    return {
      product: parsed.product,
      category: parsed.category,
      partNumber: typeof parsed.partNumber === "string" ? parsed.partNumber : null,
      brand: typeof parsed.brand === "string" ? parsed.brand : null,
    };
  } catch {
    return null;
  }
}

export async function generateKeywords(input: {
  productName: string;
  oemNumber?: string | null;
  hsCode?: string | null;
  imageDescription?: string | null;
  industry?: string | null;
  referenceSummary?: string | null;
  countryName: string;
}): Promise<string[]> {
  const fallback = [`${input.productName} ${input.countryName}`];

  try {
    const prompt = `You are helping find companies that import, distribute, or manufacture a specific product in a target country, for a B2B export lead generation tool.

Product name: ${input.productName}
${input.oemNumber ? `OEM/part number: ${input.oemNumber}\n` : ""}${input.hsCode ? `HS code: ${input.hsCode}\n` : ""}${input.imageDescription ? `Additional context from a product photo: ${input.imageDescription}\n` : ""}${input.industry ? `Target industry: ${input.industry}\n` : ""}${input.referenceSummary ? `Example target-customer profile: ${input.referenceSummary}\n` : ""}Target country: ${input.countryName}

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

export type CandidateScore = {
  score: number;
  websiteType: "Company Website" | "E-commerce";
  matchReason: string;
};

export async function scoreCandidates(
  candidates: { title: string; link: string; snippet: string }[],
  productContext: string,
  extraContext?: string
): Promise<Record<string, CandidateScore>> {
  if (candidates.length === 0) return {};

  try {
    const list = candidates
      .map((c, i) => `${i}. Title: ${c.title}\nURL: ${c.link}\nSnippet: ${c.snippet}`)
      .join("\n\n");

    const prompt = `You are scoring search results for relevance to a B2B export lead search.

Product context: ${productContext}
${extraContext ? `${extraContext}\n` : ""}
For each numbered search result below, analyze it and return three things:
1. "score": a confidence score from 0 to 100 for how likely this is a real company website (importer, distributor, manufacturer, wholesaler) relevant to the product context — NOT a marketplace listing, forum, news article, or unrelated business.
2. "websiteType": classify the site as either "Company Website" (a business's own corporate/brand site) or "E-commerce" (an online store/marketplace listing/shopping cart page), based on the title/URL/snippet.
3. "matchReason": one short sentence (max ~20 words) explaining why this result matches the product context. Do not mention the score itself.

${list}

Respond with a JSON object: {"scores": [{"index": 0, "score": 85, "websiteType": "Company Website", "matchReason": "..."}, ...]} covering every index.`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2200,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const result: Record<string, CandidateScore> = {};

    if (Array.isArray(parsed.scores)) {
      for (const entry of parsed.scores) {
        const idx = entry?.index;
        const score = entry?.score;
        if (typeof idx === "number" && typeof score === "number" && candidates[idx]) {
          const rawType = typeof entry?.websiteType === "string" ? entry.websiteType.toLowerCase() : "";
          const websiteType: CandidateScore["websiteType"] =
            rawType.includes("e-commerce") || rawType.includes("ecommerce") ? "E-commerce" : "Company Website";
          const matchReason = typeof entry?.matchReason === "string" ? entry.matchReason.trim().slice(0, 300) : "";
          result[candidates[idx].link] = {
            score: Math.max(0, Math.min(100, score)),
            websiteType,
            matchReason,
          };
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}

export async function analyzeReferenceWebsites(
  pages: { url: string; text: string | null }[]
): Promise<string | null> {
  const withText = pages.filter((p): p is { url: string; text: string } => !!p.text && p.text.trim().length > 0);
  if (withText.length === 0) return null;

  try {
    const list = withText.map((p, i) => `${i + 1}. ${p.url}\n${p.text.slice(0, 1500)}`).join("\n\n");

    const prompt = `You are analyzing example customer websites for a B2B export lead generation tool, to help it understand what kind of company profile the user is targeting.

Here is scraped text content from ${withText.length} example website(s) the user considers good potential customers:

${list}

Summarize, in 2-3 sentences, the common characteristics of these companies (e.g. business type, products/services offered, industry focus, scale/market) that would help identify similar companies elsewhere. Do not mention URLs or quote the text verbatim — synthesize.`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
