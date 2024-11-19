-- CreateIndex
CREATE INDEX "idx_forum_meeting_time" ON "Forum"("meeting_time");

-- CreateIndex
CREATE INDEX "idx_action_steps" ON "action_steps"("chapter_id");

-- CreateIndex
CREATE INDEX "idx_chapters" ON "chapters"("course_id", "order");

-- CreateIndex
CREATE INDEX "idx_lessons" ON "lessons"("chapter_id");

-- CreateIndex
CREATE INDEX "idx_user_forum" ON "user_forum"("user_id", "forum_id");

-- CreateIndex
CREATE INDEX "idx_user_forum_meeting_status_checkin_time" ON "user_forum_meeting_status"("checkin_time");

-- CreateIndex
CREATE INDEX "idx_user_forum_prework_status" ON "user_forum_prework_status"("user_id", "chapter_id", "forum_course_id", "lesson_id", "status_percent");
