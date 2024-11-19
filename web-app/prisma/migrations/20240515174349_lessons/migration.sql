-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('pdf', 'video', 'text', 'audio');

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "is_preview" BOOLEAN NOT NULL DEFAULT false,
    "is_prerequisite" BOOLEAN NOT NULL DEFAULT false,
    "is_discussion_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_downloadable" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdfs" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lessons_uuid_key" ON "lessons"("uuid");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "pdfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
