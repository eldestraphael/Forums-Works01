/*
  Warnings:

  - You are about to drop the `user_forum_prep_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_forum_prep_answers" DROP CONSTRAINT "user_forum_prep_answers_forum_prep_id_fkey";

-- DropForeignKey
ALTER TABLE "user_forum_prep_answers" DROP CONSTRAINT "user_forum_prep_answers_user_id_fkey";

-- DropTable
DROP TABLE "user_forum_prep_answers";

-- CreateTable
CREATE TABLE "user_forum_prep_status" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_prep_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "survey_data" JSONB NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_prep_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_prep_status_uuid_key" ON "user_forum_prep_status"("uuid");

-- AddForeignKey
ALTER TABLE "user_forum_prep_status" ADD CONSTRAINT "user_forum_prep_status_forum_prep_id_fkey" FOREIGN KEY ("forum_prep_id") REFERENCES "forum_preps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prep_status" ADD CONSTRAINT "user_forum_prep_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prep_status" ADD CONSTRAINT "user_forum_prep_status_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
