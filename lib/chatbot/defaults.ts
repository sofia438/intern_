export type ChatbotDefaults = {
  assistantName: string;
  greeting: string;
  quickActions: string[];
};


const CHATBOT_DEFAULTS: Record<string, ChatbotDefaults> = {
  en: {
    assistantName: "AI Assistant",
    greeting: "Hello! How can I help you today?",
    quickActions: [
      "What products do you offer?",
      "Do you export to Germany?",
      "Can I request a quotation?",
      "How can I contact sales?",
    ],
  },
  es: {
    assistantName: "Asistente de IA",
    greeting: "¡Hola! ¿Cómo puedo ayudarte hoy?",
    quickActions: [
      "¿Qué productos ofrecen?",
      "¿Exportan a Alemania?",
      "¿Puedo solicitar una cotización?",
      "¿Cómo puedo contactar a ventas?",
    ],
  },
  fr: {
    assistantName: "Assistant IA",
    greeting: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    quickActions: [
      "Quels produits proposez-vous ?",
      "Exportez-vous vers l'Allemagne ?",
      "Puis-je demander un devis ?",
      "Comment puis-je contacter les ventes ?",
    ],
  },
  tr: {
    assistantName: "Yapay Zeka Asistanı",
    greeting: "Merhaba! Size bugün nasıl yardımcı olabilirim?",
    quickActions: [
      "Hangi ürünleri sunuyorsunuz?",
      "Almanya'ya ihracat yapıyor musunuz?",
      "Teklif isteyebilir miyim?",
      "Satış ekibiyle nasıl iletişime geçebilirim?",
    ],
  },
};

export function getChatbotDefaults(language: string): ChatbotDefaults {
  return CHATBOT_DEFAULTS[language] ?? CHATBOT_DEFAULTS.en;
}

function isDefaultAssistantName(value: string): boolean {
  return Object.values(CHATBOT_DEFAULTS).some((d) => d.assistantName === value);
}

function isDefaultGreeting(value: string): boolean {
  return Object.values(CHATBOT_DEFAULTS).some((d) => d.greeting === value);
}

function isDefaultQuickActions(value: string[]): boolean {
  const serialized = JSON.stringify(value);
  return Object.values(CHATBOT_DEFAULTS).some((d) => JSON.stringify(d.quickActions) === serialized);
}

// A field only gets auto-translated when it's still at whatever default it was
// created with (in any supported language) — genuine user customizations are
// never overwritten by a language switch.
export function isDefaultChatbotField(
  field: "assistantName" | "greeting" | "quickActions",
  value: string | string[]
): boolean {
  if (field === "quickActions") return isDefaultQuickActions(value as string[]);
  if (field === "assistantName") return isDefaultAssistantName(value as string);
  return isDefaultGreeting(value as string);
}
