-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BACKEND', 'FRONTEND');

-- CreateTable
CREATE TABLE "maintainers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "role" "Role"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleFocus" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maintainers_discordUserId_key" ON "maintainers"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");
