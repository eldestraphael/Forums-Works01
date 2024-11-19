/*
  Warnings:

  - Added the required column `asset_type` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('pdf', 'video', 'text', 'audio');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "asset_type" "AssetType" NOT NULL;
