/*
  Warnings:

  - You are about to drop the column `chapter_id` on the `forum_preps` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `forum_preps` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'forum_prep';

-- DropForeignKey
ALTER TABLE "forum_preps" DROP CONSTRAINT "forum_preps_chapter_id_fkey";

-- AlterTable
ALTER TABLE "forum_preps" DROP COLUMN "chapter_id",
DROP COLUMN "order";
