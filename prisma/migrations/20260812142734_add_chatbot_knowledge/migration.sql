
CREATE TABLE "Chatbot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "knowledge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "Chatbot_companyId_key" ON "Chatbot"("companyId");


ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
