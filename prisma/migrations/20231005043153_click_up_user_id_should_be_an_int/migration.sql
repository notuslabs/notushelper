/*
  Warnings:

  - Changed the type of `clickUpUserId` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "clickUpUserId",
ADD COLUMN     "clickUpUserId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_clickUpUserId_key" ON "Employee"("clickUpUserId");
