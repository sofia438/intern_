-- AlterTable
ALTER TABLE "SearchJob" DROP COLUMN "city",
ADD COLUMN     "cityByCountry" JSONB;
