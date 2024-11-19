-- CreateTable
CREATE TABLE "user_forum_action_step_status" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "forum_id" INTEGER NOT NULL,
    "action_step_id" INTEGER NOT NULL,
    "message" VARCHAR(2500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_forum_action_step_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_forum_action_step_status_uuid_key" ON "user_forum_action_step_status"("uuid");

-- AddForeignKey
ALTER TABLE "user_forum_action_step_status" ADD CONSTRAINT "user_forum_action_step_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_action_step_status" ADD CONSTRAINT "user_forum_action_step_status_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forum_action_step_status" ADD CONSTRAINT "user_forum_action_step_status_action_step_id_fkey" FOREIGN KEY ("action_step_id") REFERENCES "action_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
