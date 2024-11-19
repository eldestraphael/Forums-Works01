/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `faw_thinkific_user_meta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "company_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faw_thinkific_user_meta" ALTER COLUMN "uuid" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_user_meta_uuid_key" ON "faw_thinkific_user_meta"("uuid");
