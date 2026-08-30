
ALTER TABLE "Company" ADD COLUMN     "website" TEXT,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3);


CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "hsCode" TEXT,
    "image" BYTEA,
    "imageType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "ReferenceWebsite" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceWebsite_pkey" PRIMARY KEY ("id")
);


CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");


CREATE INDEX "ReferenceWebsite_companyId_idx" ON "ReferenceWebsite"("companyId");


ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "ReferenceWebsite" ADD CONSTRAINT "ReferenceWebsite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
