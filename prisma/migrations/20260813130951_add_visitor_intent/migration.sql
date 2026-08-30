
ALTER TABLE "Message" ADD COLUMN     "intent" TEXT,
ADD COLUMN     "qualifiedLead" BOOLEAN NOT NULL DEFAULT false;

