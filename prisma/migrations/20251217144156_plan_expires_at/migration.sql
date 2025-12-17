/*
  Warnings:

  - The `testimonialType` column on the `Testimonial` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `razaorpaySubId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestimonialType" AS ENUM ('text', 'video');

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "testimonialType",
ADD COLUMN     "testimonialType" "TestimonialType";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "razaorpaySubId",
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "razorpaySubId" TEXT;
