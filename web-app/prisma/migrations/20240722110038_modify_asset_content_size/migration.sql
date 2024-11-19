/*
  Warnings:

  - You are about to drop the column `asset_content_size` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audios" ADD COLUMN     "asset_content_size" INTEGER;

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "asset_content_size" INTEGER;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "asset_content_size";

-- AlterTable
ALTER TABLE "pdfs" ADD COLUMN     "asset_content_size" INTEGER;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "asset_content_size" INTEGER;
