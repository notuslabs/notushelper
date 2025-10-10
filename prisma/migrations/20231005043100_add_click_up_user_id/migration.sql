/*
  Warnings:

  - A unique constraint covering the columns `[clickUpUserId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clickUpUserId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "clickUpUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_clickUpUserId_key" ON "Employee"("clickUpUserId");
