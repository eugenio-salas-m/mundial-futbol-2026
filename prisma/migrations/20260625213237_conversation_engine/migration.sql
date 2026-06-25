-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('main_menu', 'prediction_help', 'awaiting_prediction', 'awaiting_confirmation');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('incoming', 'outgoing');

-- CreateEnum
CREATE TYPE "ConversationMessageType" AS ENUM ('text', 'button', 'interactive', 'image', 'document', 'audio', 'video', 'location');

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "id" UUID NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "user_id" UUID,
    "organization_id" UUID,
    "state" "ConversationState" NOT NULL DEFAULT 'main_menu',
    "context" JSONB,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "message_type" "ConversationMessageType" NOT NULL DEFAULT 'text',
    "text" TEXT,
    "provider_message_id" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_sessions_phone_number_key" ON "conversation_sessions"("phone_number");

-- CreateIndex
CREATE INDEX "conversation_sessions_user_id_idx" ON "conversation_sessions"("user_id");

-- CreateIndex
CREATE INDEX "conversation_sessions_organization_id_idx" ON "conversation_sessions"("organization_id");

-- CreateIndex
CREATE INDEX "conversation_messages_session_id_idx" ON "conversation_messages"("session_id");

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
