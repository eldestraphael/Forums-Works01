-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_uuid_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
