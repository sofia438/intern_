
ALTER TABLE "Chatbot" DROP CONSTRAINT "Chatbot_companyId_fkey";


ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_companyId_fkey";


ALTER TABLE "Lead" DROP CONSTRAINT "Lead_companyId_fkey";


ALTER TABLE "Lead" DROP CONSTRAINT "Lead_conversationId_fkey";


ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";


DROP TABLE "Chatbot";


DROP TABLE "Conversation";


DROP TABLE "Lead";


DROP TABLE "Message";

