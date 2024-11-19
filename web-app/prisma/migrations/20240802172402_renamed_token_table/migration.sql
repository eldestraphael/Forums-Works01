/*
  Warnings:

  - You are about to drop the `ms365_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('microsoft', 'google', 'zoom');

-- DropForeignKey
ALTER TABLE "ms365_token" DROP CONSTRAINT "ms365_token_company_id_fkey";

-- DropTable
DROP TABLE "ms365_token";

-- CreateTable
CREATE TABLE "provider_token" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "msAuthDetails" JSONB,
    "type" "ProviderType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_token_uuid_key" ON "provider_token"("uuid");

-- AddForeignKey
ALTER TABLE "provider_token" ADD CONSTRAINT "provider_token_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
