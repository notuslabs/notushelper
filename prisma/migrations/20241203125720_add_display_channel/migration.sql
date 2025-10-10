-- CreateEnum
CREATE TYPE "DisplayChannelType" AS ENUM ('TRANFERO_BRL_BALANCE');

-- CreateTable
CREATE TABLE "display_channels" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" "DisplayChannelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "display_channels_channelId_key" ON "display_channels"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "display_channels_type_key" ON "display_channels"("type");
