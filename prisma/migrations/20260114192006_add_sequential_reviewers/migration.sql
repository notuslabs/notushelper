/*
  Warnings:

  - You are about to drop the `_DeveloperToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DeveloperToTeam" DROP CONSTRAINT "_DeveloperToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperToTeam" DROP CONSTRAINT "_DeveloperToTeam_B_fkey";

-- AlterTable
ALTER TABLE "maintainers" ADD COLUMN     "sequenceIndex" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_DeveloperToTeam";

-- DropTable
DROP TABLE "teams";
