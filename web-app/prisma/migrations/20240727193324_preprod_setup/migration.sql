-- AlterTable
ALTER TABLE "user_forum_healths" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "user_per_forum_health_score" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_healths_uuid_key" ON "user_forum_healths"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_per_forum_health_score_uuid_key" ON "user_per_forum_health_score"("uuid");