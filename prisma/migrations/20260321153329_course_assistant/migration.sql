/*
  Warnings:

  - You are about to drop the `CourseAssistant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseAssistant" DROP CONSTRAINT "CourseAssistant_assistant_id_fkey";

-- DropForeignKey
ALTER TABLE "CourseAssistant" DROP CONSTRAINT "CourseAssistant_course_id_fkey";

-- DropTable
DROP TABLE "CourseAssistant";
