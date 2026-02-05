-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('CAROUSEL', 'HORIZONTAL', 'SLANT', 'GRID');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "templateType" "TemplateType" NOT NULL DEFAULT 'CAROUSEL';
