/*
  Warnings:

  - You are about to drop the `provider_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "provider_token" DROP CONSTRAINT "provider_token_company_id_fkey";

-- DropTable
DROP TABLE "provider_token";

-- CreateTable
CREATE TABLE "oauth_provider_token" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "msAuthDetails" JSONB,
    "type" "ProviderType" NOT NULL DEFAULT 'microsoft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_provider_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_token_uuid_key" ON "oauth_provider_token"("uuid");

-- AddForeignKey
ALTER TABLE "oauth_provider_token" ADD CONSTRAINT "oauth_provider_token_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
