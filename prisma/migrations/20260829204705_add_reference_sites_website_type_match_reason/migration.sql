
ALTER TABLE "SearchJob" ADD COLUMN     "potentialCustomerWebsites" TEXT[] DEFAULT ARRAY[]::TEXT[];


ALTER TABLE "SearchResult" ADD COLUMN     "matchReason" TEXT,
ADD COLUMN     "websiteType" TEXT;
