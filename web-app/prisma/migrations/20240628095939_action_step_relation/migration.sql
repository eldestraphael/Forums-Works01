-- AddForeignKey
ALTER TABLE "action_steps" ADD CONSTRAINT "action_steps_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
