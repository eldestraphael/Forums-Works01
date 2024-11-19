/*
  Warnings:

  - The `uuid` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `Forum` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `action_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `audios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `chapter_moderator_guide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `chapters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `faw_thinkific_course_meta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `faw_thinkific_courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `faw_thinkific_user_meta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `forum_course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `forum_health_mcqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `forum_meetings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `health_mcq_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `images` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `lessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `ms365_token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `pdfs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `userResetPasswordOtps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `user_forum` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `user_forum_action_step_status` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `user_forum_meeting_status` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `user_forum_prework_status` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uuid` column on the `videos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Forum" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "User" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "action_steps" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "audios" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "chapter_moderator_guide" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "faw_thinkific_course_meta" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "faw_thinkific_courses" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "faw_thinkific_user_meta" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "forum_course" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "forum_health_mcqs" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "forum_meetings" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "health_mcq_options" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "images" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "ms365_token" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "pdfs" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "userResetPasswordOtps" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user_forum" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user_forum_action_step_status" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user_forum_meeting_status" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user_forum_prework_status" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "Company_uuid_key" ON "Company"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_uuid_key" ON "Forum"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "action_steps_uuid_key" ON "action_steps"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "audios_uuid_key" ON "audios"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_moderator_guide_uuid_key" ON "chapter_moderator_guide"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_uuid_key" ON "chapters"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "courses_uuid_key" ON "courses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_course_meta_uuid_key" ON "faw_thinkific_course_meta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_courses_uuid_key" ON "faw_thinkific_courses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_user_meta_uuid_key" ON "faw_thinkific_user_meta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "forum_course_uuid_key" ON "forum_course"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "forum_health_mcqs_uuid_key" ON "forum_health_mcqs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "forum_meetings_uuid_key" ON "forum_meetings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "health_mcq_options_uuid_key" ON "health_mcq_options"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "images_uuid_key" ON "images"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_uuid_key" ON "lessons"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ms365_token_uuid_key" ON "ms365_token"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pdfs_uuid_key" ON "pdfs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "userResetPasswordOtps_uuid_key" ON "userResetPasswordOtps"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_uuid_key" ON "user_forum"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_action_step_status_uuid_key" ON "user_forum_action_step_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_meeting_status_uuid_key" ON "user_forum_meeting_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_prework_status_uuid_key" ON "user_forum_prework_status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "videos_uuid_key" ON "videos"("uuid");
