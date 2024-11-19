-- CreateTable
CREATE TABLE "faw_thinkific_courses" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "faw_thinkific_course_meta_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "product_id" INTEGER NOT NULL,
    "description" VARCHAR(255),
    "thinkific_user_id" INTEGER,
    "instructor_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faw_thinkific_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faw_thinkific_course_meta" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "migrated_count" INTEGER,
    "thinkific_total_items" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faw_thinkific_course_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_courses_uuid_key" ON "faw_thinkific_courses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "faw_thinkific_course_meta_uuid_key" ON "faw_thinkific_course_meta"("uuid");
