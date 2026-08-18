-- DropForeignKey
ALTER TABLE "Chatbot" DROP CONSTRAINT "Chatbot_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropTable
DROP TABLE "Chatbot";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Lead";

-- DropTable
DROP TABLE "Message";

