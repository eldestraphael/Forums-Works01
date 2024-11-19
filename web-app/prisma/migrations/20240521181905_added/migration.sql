-- CreateTable
CREATE TABLE "forum_course" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "forum_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "chapter_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current_course" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "forum_course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_course_uuid_key" ON "forum_course"("uuid");

-- AddForeignKey
ALTER TABLE "forum_course" ADD CONSTRAINT "forum_course_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_course" ADD CONSTRAINT "forum_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_course" ADD CONSTRAINT "forum_course_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
