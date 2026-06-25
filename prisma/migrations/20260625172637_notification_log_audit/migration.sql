-- AlterTable
ALTER TABLE "notification_logs" ADD COLUMN     "provider_message_id" VARCHAR(200),
ADD COLUMN     "provider_response" JSONB,
ADD COLUMN     "request_payload" JSONB;
