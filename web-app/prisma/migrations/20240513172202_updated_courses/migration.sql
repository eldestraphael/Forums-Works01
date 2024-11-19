/*
  Warnings:

  - Added the required column `no_of_lessons` to the `chapters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "no_of_lessons" INTEGER NOT NULL;
