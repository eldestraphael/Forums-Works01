/*
  Warnings:

  - You are about to drop the column `msAuthDetails` on the `oauth_provider_token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "oauth_provider_token" DROP COLUMN "msAuthDetails",
ADD COLUMN     "oauth_details" JSONB;
