-- AlterTable
ALTER TABLE "ranking_daily_summaries" ADD COLUMN     "emails_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emails_sent_at" TIMESTAMP(3);
