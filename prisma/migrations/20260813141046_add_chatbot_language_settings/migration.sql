-- AlterTable
ALTER TABLE "Chatbot" ADD COLUMN     "languageMode" TEXT NOT NULL DEFAULT 'automatic',
ADD COLUMN     "supportedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[];

