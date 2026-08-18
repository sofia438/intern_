-- CreateTable
CREATE TABLE "WebsiteVisitor" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "visitorCookie" TEXT NOT NULL,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "organization" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationPermission" BOOLEAN,
    "firstVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" TIMESTAMP(3) NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WebsiteVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteVisitor_companyId_lastVisit_idx" ON "WebsiteVisitor"("companyId", "lastVisit");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteVisitor_companyId_visitorCookie_key" ON "WebsiteVisitor"("companyId", "visitorCookie");

-- AddForeignKey
ALTER TABLE "WebsiteVisitor" ADD CONSTRAINT "WebsiteVisitor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
