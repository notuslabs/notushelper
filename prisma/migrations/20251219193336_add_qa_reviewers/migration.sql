-- AlterTable
ALTER TABLE "_DeveloperToTeam" ADD CONSTRAINT "_DeveloperToTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DeveloperToTeam_AB_unique";

-- CreateTable
CREATE TABLE "qa_reviewers" (
    "id" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_reviewers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qa_reviewers_discordUserId_key" ON "qa_reviewers"("discordUserId");
