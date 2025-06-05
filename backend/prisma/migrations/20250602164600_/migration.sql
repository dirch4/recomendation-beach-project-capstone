/*
  Warnings:

  - The primary key for the `Reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `confirmPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cretedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placeId,userId]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Reviews` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reviews_placeId_key";

-- AlterTable
ALTER TABLE "Beach" ADD COLUMN     "negativeSentimentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "neutralSentimentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "positiveSentimentCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "reviews" SET DEFAULT 0,
ALTER COLUMN "rating" SET DEFAULT 0.0,
ALTER COLUMN "featured_image" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "review_keywords" DROP NOT NULL,
ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "coordinates" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "confirmPassword",
DROP COLUMN "cretedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_placeId_userId_key" ON "Reviews"("placeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
