/*
  Warnings:

  - The values [text,video] on the enum `TestimonialType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `message` on the `Testimonial` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TestimonialType_new" AS ENUM ('TEXT', 'VIDEO', 'TWITTER', 'INSTAGRAM');
ALTER TABLE "Testimonial" ALTER COLUMN "testimonialType" TYPE "TestimonialType_new" USING ("testimonialType"::text::"TestimonialType_new");
ALTER TYPE "TestimonialType" RENAME TO "TestimonialType_old";
ALTER TYPE "TestimonialType_new" RENAME TO "TestimonialType";
DROP TYPE "public"."TestimonialType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "message",
ADD COLUMN     "content" TEXT;
