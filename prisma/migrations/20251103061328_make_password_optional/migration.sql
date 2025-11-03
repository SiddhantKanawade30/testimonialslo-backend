-- DropIndex
DROP INDEX "public"."User_password_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
