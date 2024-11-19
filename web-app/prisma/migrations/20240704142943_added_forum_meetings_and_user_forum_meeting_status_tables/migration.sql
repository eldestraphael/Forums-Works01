-- CreateEnum
CREATE TYPE "meetingType" AS ENUM ('zoom', 'bluetooth');

-- CreateTable
CREATE TABLE "forum_meetings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "forum_id" INTEGER NOT NULL,
    "meeting_started_by" INTEGER NOT NULL,
    "meeting_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_forum_meeting_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "forum_meeting_id" INTEGER NOT NULL,
    "meeting_type" "meetingType" NOT NULL DEFAULT 'zoom',
    "checkin_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkout_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_meeting_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_meetings_uuid_key" ON "forum_meetings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_meeting_status_uuid_key" ON "user_forum_meeting_status"("uuid");

-- AddForeignKey
ALTER TABLE "forum_meetings" ADD CONSTRAINT "forum_meetings_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_meeting_status" ADD CONSTRAINT "user_forum_meeting_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_meeting_status" ADD CONSTRAINT "user_forum_meeting_status_forum_meeting_id_fkey" FOREIGN KEY ("forum_meeting_id") REFERENCES "forum_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
