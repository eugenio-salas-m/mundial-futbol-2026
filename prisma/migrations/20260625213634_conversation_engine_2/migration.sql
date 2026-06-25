/*
  Warnings:

  - A unique constraint covering the columns `[channel,phone_number]` on the table `conversation_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('whatsapp', 'telegram', 'webchat');

-- DropIndex
DROP INDEX "conversation_sessions_phone_number_key";

-- AlterTable
ALTER TABLE "conversation_sessions" ADD COLUMN     "channel" "ConversationChannel" NOT NULL DEFAULT 'whatsapp';

-- CreateIndex
CREATE UNIQUE INDEX "conversation_sessions_channel_phone_number_key" ON "conversation_sessions"("channel", "phone_number");
