-- CreateEnum
CREATE TYPE "SearchJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "SearchJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "oemNumber" TEXT,
    "hsCode" TEXT,
    "imageDescription" TEXT,
    "countries" TEXT[],
    "searchEngines" TEXT[] DEFAULT ARRAY['google']::TEXT[],
    "status" "SearchJobStatus" NOT NULL DEFAULT 'PENDING',
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SearchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "searchJobId" TEXT NOT NULL,
    "companyName" TEXT,
    "website" TEXT NOT NULL,
    "country" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchResult_searchJobId_website_key" ON "SearchResult"("searchJobId", "website");

-- AddForeignKey
ALTER TABLE "SearchJob" ADD CONSTRAINT "SearchJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchJob" ADD CONSTRAINT "SearchJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_searchJobId_fkey" FOREIGN KEY ("searchJobId") REFERENCES "SearchJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
