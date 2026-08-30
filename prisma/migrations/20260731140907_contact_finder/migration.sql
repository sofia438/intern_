
ALTER TABLE "SearchJob" ADD COLUMN     "contactFinderCompletedAt" TIMESTAMP(3),
ADD COLUMN     "contactFinderResultsCount" INTEGER,
ADD COLUMN     "contactFinderStatus" "SearchJobStatus";


ALTER TABLE "SearchResult" ADD COLUMN     "contactConfidence" DOUBLE PRECISION,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactSourcePage" TEXT,
ADD COLUMN     "contactTitle" TEXT;
