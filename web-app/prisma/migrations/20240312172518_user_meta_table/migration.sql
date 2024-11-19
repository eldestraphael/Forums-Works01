-- AlterTable
ALTER TABLE "User" ADD COLUMN     "faw_thinkific_user_meta_id" INTEGER,
ALTER COLUMN "job_title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "faw_thinkific_user_meta" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(50) NOT NULL,
    "migrated_count" SMALLINT NOT NULL,
    "thinkific_total_items" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faw_thinkific_user_meta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_faw_thinkific_user_meta_id_fkey" FOREIGN KEY ("faw_thinkific_user_meta_id") REFERENCES "faw_thinkific_user_meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
