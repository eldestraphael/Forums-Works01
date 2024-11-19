-- AlterTable
ALTER TABLE "ms365_token" DROP COLUMN "msAuthDetails",
ADD COLUMN     "msAuthDetails" JSONB;
