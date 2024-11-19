-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'survey';

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "survey_id" INTEGER;

-- CreateTable
CREATE TABLE "surveys" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "survey_data" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "asset_content_size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "surveys_uuid_key" ON "surveys"("uuid");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
