/*
  Warnings:

  - The values [variantA,variantB,variantC,variantD] on the enum `ExamAnswer` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[question_id]` on the table `QuestionAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExamAnswer_new" AS ENUM ('A', 'B', 'C', 'D');
ALTER TABLE "Exam" ALTER COLUMN "answer" TYPE "ExamAnswer_new" USING ("answer"::text::"ExamAnswer_new");
ALTER TABLE "StudentExamQuestion" ALTER COLUMN "answer" TYPE "ExamAnswer_new" USING ("answer"::text::"ExamAnswer_new");
ALTER TYPE "ExamAnswer" RENAME TO "ExamAnswer_old";
ALTER TYPE "ExamAnswer_new" RENAME TO "ExamAnswer";
DROP TYPE "public"."ExamAnswer_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_question_id_key" ON "QuestionAnswer"("question_id");
