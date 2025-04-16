-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'credentials',
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
