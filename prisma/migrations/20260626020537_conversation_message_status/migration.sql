-- AlterTable
ALTER TABLE "conversation_messages" ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'sent';
