-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role_uuid" TEXT;

-- CreateTable
CREATE TABLE "roles" (
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "scopes" (
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scopes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "modules" (
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "keyword" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "sub_modules" (
    "uuid" TEXT NOT NULL,
    "module_uuid" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "keyword" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "redirect_url" VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_modules_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "actions" (
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "keyword" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "role_privileges" (
    "uuid" TEXT NOT NULL,
    "role_uuid" TEXT NOT NULL,
    "scope_uuid" TEXT NOT NULL,
    "module_uuid" TEXT NOT NULL,
    "sub_module_uuid" TEXT NOT NULL,
    "action_uuid" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_privileges_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_modules" ADD CONSTRAINT "sub_modules_module_uuid_fkey" FOREIGN KEY ("module_uuid") REFERENCES "modules"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_privileges" ADD CONSTRAINT "role_privileges_role_uuid_fkey" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_privileges" ADD CONSTRAINT "role_privileges_scope_uuid_fkey" FOREIGN KEY ("scope_uuid") REFERENCES "scopes"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_privileges" ADD CONSTRAINT "role_privileges_module_uuid_fkey" FOREIGN KEY ("module_uuid") REFERENCES "modules"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_privileges" ADD CONSTRAINT "role_privileges_sub_module_uuid_fkey" FOREIGN KEY ("sub_module_uuid") REFERENCES "sub_modules"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_privileges" ADD CONSTRAINT "role_privileges_action_uuid_fkey" FOREIGN KEY ("action_uuid") REFERENCES "actions"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
