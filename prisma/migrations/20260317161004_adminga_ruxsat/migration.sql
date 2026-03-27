-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ASSISTANT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPrimaryAdmin" BOOLEAN NOT NULL DEFAULT false;
