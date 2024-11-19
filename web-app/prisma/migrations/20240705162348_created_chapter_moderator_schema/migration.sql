-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('header', 'body', 'footer');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('logical', 'repeatable', 'once');

-- CreateTable
CREATE TABLE "chapter_moderator_guide" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "section_type" "SectionType" NOT NULL,
    "type" "Type" NOT NULL,
    "title" VARCHAR(250),
    "description" VARCHAR(2500),
    "order" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "duration_per_person" INTEGER,
    "link" VARCHAR(250),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_moderator_guide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chapter_moderator_guide_uuid_key" ON "chapter_moderator_guide"("uuid");

-- AddForeignKey
ALTER TABLE "chapter_moderator_guide" ADD CONSTRAINT "chapter_moderator_guide_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
