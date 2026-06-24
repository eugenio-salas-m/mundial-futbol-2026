-- CreateTable
CREATE TABLE "ranking_daily_summaries" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "summary_date" TIMESTAMP(3) NOT NULL,
    "leader_user_id" UUID,
    "leader_name" TEXT,
    "top_rise_user_id" UUID,
    "top_rise_name" TEXT,
    "top_rise_places" INTEGER NOT NULL DEFAULT 0,
    "top_fall_user_id" UUID,
    "top_fall_name" TEXT,
    "top_fall_places" INTEGER NOT NULL DEFAULT 0,
    "summary_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ranking_daily_summaries_organization_id_idx" ON "ranking_daily_summaries"("organization_id");

-- CreateIndex
CREATE INDEX "ranking_daily_summaries_summary_date_idx" ON "ranking_daily_summaries"("summary_date");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_daily_summaries_organization_id_summary_date_key" ON "ranking_daily_summaries"("organization_id", "summary_date");

-- AddForeignKey
ALTER TABLE "ranking_daily_summaries" ADD CONSTRAINT "ranking_daily_summaries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_daily_summaries" ADD CONSTRAINT "ranking_daily_summaries_leader_user_id_fkey" FOREIGN KEY ("leader_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_daily_summaries" ADD CONSTRAINT "ranking_daily_summaries_top_rise_user_id_fkey" FOREIGN KEY ("top_rise_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_daily_summaries" ADD CONSTRAINT "ranking_daily_summaries_top_fall_user_id_fkey" FOREIGN KEY ("top_fall_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
