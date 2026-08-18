-- CreateEnum
CREATE TYPE "SearchType" AS ENUM ('WEBSITE', 'MAPS');

-- AlterTable
ALTER TABLE "SearchJob" ADD COLUMN     "city" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "radiusKm" INTEGER,
ADD COLUMN     "searchType" "SearchType" NOT NULL DEFAULT 'WEBSITE';

-- AlterTable
ALTER TABLE "SearchResult" ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviewsCount" INTEGER,
ALTER COLUMN "website" DROP NOT NULL;
