-- CreateEnum
CREATE TYPE "AvatarMode" AS ENUM ('google', 'ai');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiAvatarUrl" TEXT,
ADD COLUMN     "avatarGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "avatarMode" "AvatarMode" NOT NULL DEFAULT 'google',
ADD COLUMN     "avatarPrompt" TEXT,
ADD COLUMN     "googleAvatarUrl" TEXT;
