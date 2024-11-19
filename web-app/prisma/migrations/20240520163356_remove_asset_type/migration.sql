/*
  Warnings:

  - You are about to drop the column `asset_id` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `asset_type` on the `lessons` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_asset_id_fkey";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "asset_id",
DROP COLUMN "asset_type",
ADD COLUMN     "pdf_id" INTEGER;

-- DropEnum
DROP TYPE "AssetType";

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_pdf_id_fkey" FOREIGN KEY ("pdf_id") REFERENCES "pdfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
