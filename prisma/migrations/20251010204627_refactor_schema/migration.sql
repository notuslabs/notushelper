/*
  Warnings:

  - You are about to drop the column `clickUpUserId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `display_channels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Employee_clickUpUserId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "clickUpUserId";

-- DropTable
DROP TABLE "display_channels";

-- DropTable
DROP TABLE "projects";

-- DropEnum
DROP TYPE "DisplayChannelType";

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DeveloperToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperToTeam_AB_unique" ON "_DeveloperToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperToTeam_B_index" ON "_DeveloperToTeam"("B");

-- AddForeignKey
ALTER TABLE "_DeveloperToTeam" ADD CONSTRAINT "_DeveloperToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "maintainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperToTeam" ADD CONSTRAINT "_DeveloperToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
