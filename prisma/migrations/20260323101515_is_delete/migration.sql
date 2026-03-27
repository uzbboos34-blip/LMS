/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `StudentExamQuestion` table. All the data in the column will be lost.
  - Added the required column `section_id` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section_id` to the `StudentExamQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentExamQuestion" DROP CONSTRAINT "StudentExamQuestion_sectionId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "sectionId",
ADD COLUMN     "section_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentExamQuestion" DROP COLUMN "sectionId",
ADD COLUMN     "section_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "SectionLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExamQuestion" ADD CONSTRAINT "StudentExamQuestion_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "SectionLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
