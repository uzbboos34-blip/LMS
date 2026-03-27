/*
  Warnings:

  - A unique constraint covering the columns `[user_id,section_id]` on the table `ExamResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_user_id_section_id_key" ON "ExamResult"("user_id", "section_id");
