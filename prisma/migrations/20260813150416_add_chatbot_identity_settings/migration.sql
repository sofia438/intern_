
ALTER TABLE "Chatbot" ADD COLUMN     "assistantName" TEXT NOT NULL DEFAULT 'AI Assistant',
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "greeting" TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
ADD COLUMN     "quickActions" TEXT[] DEFAULT ARRAY['What products do you offer?', 'Do you export to Germany?', 'Can I request a quotation?', 'How can I contact sales?']::TEXT[],
ADD COLUMN     "themeColor" TEXT NOT NULL DEFAULT '#4f46e5';

