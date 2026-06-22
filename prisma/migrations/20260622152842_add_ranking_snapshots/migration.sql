-- CreateTable
CREATE TABLE "ranking_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "total_points" INTEGER NOT NULL,
    "organization_rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ranking_snapshots_user_id_idx" ON "ranking_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "ranking_snapshots_organization_id_idx" ON "ranking_snapshots"("organization_id");

-- CreateIndex
CREATE INDEX "ranking_snapshots_created_at_idx" ON "ranking_snapshots"("created_at");

-- AddForeignKey
ALTER TABLE "ranking_snapshots" ADD CONSTRAINT "ranking_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_snapshots" ADD CONSTRAINT "ranking_snapshots_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
