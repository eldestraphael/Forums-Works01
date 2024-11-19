-- AlterTable
ALTER TABLE "forum_course" ADD COLUMN     "starting_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_forum_prework_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "forum_course_id" INTEGER NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "status_percent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_prework_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_prework_status_uuid_key" ON "user_forum_prework_status"("uuid");

-- AddForeignKey
ALTER TABLE "user_forum_prework_status" ADD CONSTRAINT "user_forum_prework_status_forum_course_id_fkey" FOREIGN KEY ("forum_course_id") REFERENCES "forum_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prework_status" ADD CONSTRAINT "user_forum_prework_status_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prework_status" ADD CONSTRAINT "user_forum_prework_status_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
