/*
  Warnings:

  - A unique constraint covering the columns `[discordUserId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Employee_discordUserId_key" ON "Employee"("discordUserId");
