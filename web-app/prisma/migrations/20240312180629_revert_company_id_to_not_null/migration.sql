/*
  Warnings:

  - Made the column `company_name` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "company_name" SET NOT NULL;
