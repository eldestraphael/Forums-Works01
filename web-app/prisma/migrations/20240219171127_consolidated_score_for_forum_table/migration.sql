-- CreateTable
CREATE TABLE "user_forum_healths" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "forum_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" DECIMAL(9,6) NOT NULL,
    "health_mcq_option_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_healths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_per_forum_health_score" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "forum_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" DECIMAL(9,6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_per_forum_health_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_healths_uuid_key" ON "user_forum_healths"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_per_forum_health_score_uuid_key" ON "user_per_forum_health_score"("uuid");

-- AddForeignKey
ALTER TABLE "user_forum_healths" ADD CONSTRAINT "user_forum_healths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_healths" ADD CONSTRAINT "user_forum_healths_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_healths" ADD CONSTRAINT "user_forum_healths_health_mcq_option_id_fkey" FOREIGN KEY ("health_mcq_option_id") REFERENCES "health_mcq_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_per_forum_health_score" ADD CONSTRAINT "user_per_forum_health_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_per_forum_health_score" ADD CONSTRAINT "user_per_forum_health_score_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
