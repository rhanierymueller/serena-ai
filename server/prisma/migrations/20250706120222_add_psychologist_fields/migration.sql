-- AlterTable
ALTER TABLE "User" ADD COLUMN     "crpNumber" TEXT,
ADD COLUMN     "crpStatus" TEXT,
ADD COLUMN     "identityBackPhoto" TEXT,
ADD COLUMN     "identityFrontPhoto" TEXT,
ADD COLUMN     "isPsychologist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "professionalLicense" TEXT,
ADD COLUMN     "specialty" TEXT;
