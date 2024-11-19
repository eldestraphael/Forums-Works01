/*
  Warnings:

  - You are about to alter the column `order` on the `modules` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(9,2)`.
  - You are about to alter the column `order` on the `sub_modules` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(9,2)`.

*/
-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "order" SET DATA TYPE DECIMAL(9,2);

-- AlterTable
ALTER TABLE "sub_modules" ALTER COLUMN "order" SET DATA TYPE DECIMAL(9,2);
