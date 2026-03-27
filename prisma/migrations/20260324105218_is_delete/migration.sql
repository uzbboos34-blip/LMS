/*
  Warnings:

  - Made the column `note` on table `LessonFile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LessonFile" ALTER COLUMN "file" DROP NOT NULL,
ALTER COLUMN "note" SET NOT NULL;
