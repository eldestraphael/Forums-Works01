-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "forum_prep_id" INTEGER;

-- CreateTable
CREATE TABLE "forum_preps" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chapter_id" INTEGER NOT NULL,
    "survey_data" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "asset_content_size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_preps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_forum_prep_answers" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_prep_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "q_uuid" VARCHAR(255) NOT NULL,
    "correct_answer" VARCHAR(255) NOT NULL,
    "choices" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_prep_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_preps_uuid_key" ON "forum_preps"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_prep_answers_uuid_key" ON "user_forum_prep_answers"("uuid");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_forum_prep_id_fkey" FOREIGN KEY ("forum_prep_id") REFERENCES "forum_preps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_preps" ADD CONSTRAINT "forum_preps_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prep_answers" ADD CONSTRAINT "user_forum_prep_answers_forum_prep_id_fkey" FOREIGN KEY ("forum_prep_id") REFERENCES "forum_preps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_prep_answers" ADD CONSTRAINT "user_forum_prep_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
