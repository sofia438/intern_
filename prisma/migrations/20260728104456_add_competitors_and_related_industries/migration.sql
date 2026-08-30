
ALTER TABLE "SearchJob" ADD COLUMN     "competitorBrands" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "relatedIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[];
