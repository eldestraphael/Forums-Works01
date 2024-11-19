-- CreateTable
CREATE TABLE "user_fcm_token" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "fcm_token" VARCHAR(250) NOT NULL,
    "device_id" VARCHAR(250) NOT NULL,
    "device_meta" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_fcm_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_fcm_token_device_id_key" ON "user_fcm_token"("device_id");

-- AddForeignKey
ALTER TABLE "user_fcm_token" ADD CONSTRAINT "user_fcm_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
