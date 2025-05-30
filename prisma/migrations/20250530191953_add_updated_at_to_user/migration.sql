/*
  Warnings:

  - You are about to drop the column `confirmPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cretedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "confirmPassword",
DROP COLUMN "cretedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
