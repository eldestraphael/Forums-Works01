-- CreateTable
CREATE TABLE "action_steps" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "times_per_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "action_steps_uuid_key" ON "action_steps"("uuid");
