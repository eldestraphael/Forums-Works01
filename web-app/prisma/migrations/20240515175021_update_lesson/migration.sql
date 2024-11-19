/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `pdfs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pdfs" ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "pdfs_uuid_key" ON "pdfs"("uuid");
