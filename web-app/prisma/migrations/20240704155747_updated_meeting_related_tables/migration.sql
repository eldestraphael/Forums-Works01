-- AlterTable
ALTER TABLE "user_forum_meeting_status" ALTER COLUMN "checkout_time" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "forum_meetings" ADD CONSTRAINT "forum_meetings_meeting_started_by_fkey" FOREIGN KEY ("meeting_started_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
