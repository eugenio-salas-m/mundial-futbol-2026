-- CreateEnum
CREATE TYPE "PredictionEntrySource" AS ENUM ('web', 'whatsapp_ai');

-- AlterTable
ALTER TABLE "conversation_messages" ADD COLUMN     "notification_log_id" UUID;

-- AlterTable
ALTER TABLE "predictions" ADD COLUMN     "entrySource" "PredictionEntrySource" NOT NULL DEFAULT 'web';

-- CreateIndex
CREATE INDEX "conversation_messages_notification_log_id_idx" ON "conversation_messages"("notification_log_id");

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_notification_log_id_fkey" FOREIGN KEY ("notification_log_id") REFERENCES "notification_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
