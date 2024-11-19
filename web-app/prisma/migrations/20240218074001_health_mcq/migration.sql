-- CreateTable
CREATE TABLE "forum_health_mcqs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "mcq_title" VARCHAR(255) NOT NULL,
    "mcq_description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_health_mcqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_mcq_options" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "forum_health_mcq_id" INTEGER NOT NULL,
    "mcq_option" VARCHAR(255) NOT NULL,
    "mcq_option_description" VARCHAR(255),
    "mcq_option_value" DECIMAL(9,6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_mcq_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_health_mcqs_uuid_key" ON "forum_health_mcqs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "health_mcq_options_uuid_key" ON "health_mcq_options"("uuid");

-- AddForeignKey
ALTER TABLE "health_mcq_options" ADD CONSTRAINT "health_mcq_options_forum_health_mcq_id_fkey" FOREIGN KEY ("forum_health_mcq_id") REFERENCES "forum_health_mcqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
