import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";

export const VISITOR_INTENTS = [
  "product_inquiry",
  "availability_inquiry",
  "quotation_request",
  "catalog_request",
  "export_country_inquiry",
  "contact_sales_request",
  "company_info_inquiry",
  "other",
] as const;

export type VisitorIntent = (typeof VISITOR_INTENTS)[number];

const CORE_SYSTEM_PROMPT = `You are a helpful, professional AI assistant embedded as a chat widget on a B2B export company's website.
- Be concise and conversational — a few sentences at most.
- If you do not have enough information to answer accurately, say so honestly and offer to connect the visitor with the company's team. Never invent facts.
- Never ask the visitor to list their name, email, and phone number yourself — a contact form is shown automatically right after any message you mark as a qualified lead, so just acknowledge their interest naturally (e.g. "I'd love to connect you with our team — could you share a few details below?").`;

const AUTOMATIC_LANGUAGE_NOTE = "- Always reply in the same language the visitor is writing in.";

function restrictedLanguageNote(supportedLanguages: string[]): string {
  const list = supportedLanguages.join(", ");
  const fallback = supportedLanguages[0] ?? "English";
  return `- This company only supports these languages: ${list}. If the visitor is writing in one of these languages, reply in that same language. If they write in any other language, reply in ${fallback} explaining that support is currently limited to ${list}, and ask them to continue in one of those languages.`;
}

const CLASSIFICATION_INSTRUCTIONS = `After writing your reply, classify the visitor's latest message:
- "intent": exactly one of ${VISITOR_INTENTS.map((i) => `"${i}"`).join(", ")}. Pricing/cost questions count as "quotation_request".
- "qualifiedLead": true if the message shows a strong buying signal — e.g. asking for a quotation, a specific quantity, wanting a sales rep to contact them, requesting a catalog, or asking about price. Otherwise false.
- "needsFallback": true if your reply is telling the visitor you don't have enough information to answer and are offering to connect them with the team (i.e. you could not actually answer their question from what you know). Otherwise false. A message can be both qualifiedLead and needsFallback, or neither.

Respond with a JSON object only, in this exact shape: {"reply": "...", "intent": "...", "qualifiedLead": true|false, "needsFallback": true|false}`;

const LEAD_ALREADY_CAPTURED_NOTE =
  "\n\nThe visitor has already shared their contact details earlier in this conversation — do not ask for them again, and do not mark any further message as a qualified lead or needing fallback; just keep helping normally.";

export type ChatHistoryItem = { role: "visitor" | "assistant"; content: string };

export type LanguageSettings = { mode: string; supportedLanguages: string[] };

export type ChatReplyResult = {
  reply: string;
  intent: VisitorIntent;
  qualifiedLead: boolean;
  needsFallback: boolean;
};

export const FALLBACK_REPLY = "Sorry, I'm having trouble responding right now. Please try again in a moment.";

const FALLBACK_RESULT: ChatReplyResult = { reply: FALLBACK_REPLY, intent: "other", qualifiedLead: false, needsFallback: false };

const MAX_HISTORY_MESSAGES = 20;

export async function generateChatReply(
  history: ChatHistoryItem[],
  knowledge?: string | null,
  hasLead?: boolean,
  languageSettings?: LanguageSettings
): Promise<ChatReplyResult> {
  try {
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    const isRestricted = languageSettings?.mode === "restricted" && languageSettings.supportedLanguages.length > 0;
    const languageNote = isRestricted ? restrictedLanguageNote(languageSettings!.supportedLanguages) : AUTOMATIC_LANGUAGE_NOTE;

    let systemPrompt = `${CORE_SYSTEM_PROMPT}\n${languageNote}\n\n${CLASSIFICATION_INSTRUCTIONS}`;
    if (knowledge?.trim()) {
      systemPrompt += `\n\nUse the following company information to answer questions. Only rely on facts stated here — if something isn't covered, say you don't have that information yet.\n\nCompany information:\n${knowledge.trim()}`;
    }
    if (hasLead) systemPrompt += LEAD_ALREADY_CAPTURED_NOTE;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((m) => ({
          role: m.role === "visitor" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return FALLBACK_RESULT;

    const parsed = JSON.parse(raw);
    const reply = typeof parsed.reply === "string" && parsed.reply.trim() ? parsed.reply.trim() : FALLBACK_REPLY;
    const intent: VisitorIntent = VISITOR_INTENTS.includes(parsed.intent) ? parsed.intent : "other";
    const qualifiedLead = hasLead ? false : parsed.qualifiedLead === true;
    const needsFallback = hasLead ? false : parsed.needsFallback === true;

    return { reply, intent, qualifiedLead, needsFallback };
  } catch {
    return FALLBACK_RESULT;
  }
}
