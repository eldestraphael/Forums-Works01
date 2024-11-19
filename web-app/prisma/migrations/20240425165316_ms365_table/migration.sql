-- CreateTable
CREATE TABLE "ms365_token" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "msAuthDetails" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ms365_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ms365_token_uuid_key" ON "ms365_token"("uuid");

-- AddForeignKey
ALTER TABLE "ms365_token" ADD CONSTRAINT "ms365_token_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
