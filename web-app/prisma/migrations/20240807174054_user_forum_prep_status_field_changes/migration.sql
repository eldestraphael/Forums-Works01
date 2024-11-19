/*
  Warnings:

  - You are about to drop the column `survey_data` on the `forum_preps` table. All the data in the column will be lost.
  - You are about to drop the column `lesson_id` on the `user_forum_prep_status` table. All the data in the column will be lost.
  - You are about to drop the column `survey_data` on the `user_forum_prep_status` table. All the data in the column will be lost.
  - Added the required column `forum_prep_data` to the `forum_preps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forum_prep_answers` to the `user_forum_prep_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `user_forum_prep_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_forum_prework_status_id` to the `user_forum_prep_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_forum_prep_status" DROP CONSTRAINT "user_forum_prep_status_lesson_id_fkey";

-- AlterTable
ALTER TABLE "forum_preps" DROP COLUMN "survey_data",
ADD COLUMN     "forum_prep_data" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "user_forum_prep_status" DROP COLUMN "lesson_id",
DROP COLUMN "survey_data",
ADD COLUMN     "forum_prep_answers" JSONB NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "user_forum_prework_status_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "user_forum_prep_status" ADD CONSTRAINT "user_forum_prep_status_user_forum_prework_status_id_fkey" FOREIGN KEY ("user_forum_prework_status_id") REFERENCES "user_forum_prework_status"("id") ON DELETE CASCADE ON UPDATE CASCADE;
