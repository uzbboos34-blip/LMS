/*
  Warnings:

  - The values [A,B,C,D] on the enum `ExamAnswer` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExamAnswer_new" AS ENUM ('variantA', 'variantB', 'variantC', 'variantD');
ALTER TABLE "Exam" ALTER COLUMN "answer" TYPE "ExamAnswer_new" USING ("answer"::text::"ExamAnswer_new");
ALTER TABLE "StudentExamQuestion" ALTER COLUMN "answer" TYPE "ExamAnswer_new" USING ("answer"::text::"ExamAnswer_new");
ALTER TYPE "ExamAnswer" RENAME TO "ExamAnswer_old";
ALTER TYPE "ExamAnswer_new" RENAME TO "ExamAnswer";
DROP TYPE "public"."ExamAnswer_old";
COMMIT;
