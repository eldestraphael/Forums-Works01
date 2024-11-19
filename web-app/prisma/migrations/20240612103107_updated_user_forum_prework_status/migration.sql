/*
  Warnings:

  - Added the required column `user_id` to the `user_forum_prework_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_forum_prework_status" ADD COLUMN     "is_current_lesson" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "user_forum_prework_status" ADD CONSTRAINT "user_forum_prework_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
