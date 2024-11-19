-- AlterTable
ALTER TABLE "actions" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "chapters" ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "faw_thinkific_courses" ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "scopes" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);

-- AlterTable
ALTER TABLE "sub_modules" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2500);