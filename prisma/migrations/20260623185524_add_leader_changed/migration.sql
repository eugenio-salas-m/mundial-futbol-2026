-- AlterTable
ALTER TABLE "ranking_daily_summaries" ADD COLUMN     "leader_changed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previous_leader_id" UUID,
ADD COLUMN     "previous_leader_name" TEXT;
