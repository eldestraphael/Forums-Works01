-- DropForeignKey
ALTER TABLE "user_fcm_tokens" DROP CONSTRAINT "user_fcm_tokens_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_fcm_tokens" ADD CONSTRAINT "user_fcm_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
