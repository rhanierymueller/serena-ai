-- AlterTable
ALTER TABLE "User" ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streakLastDay" TIMESTAMP(3);
