/*
  Warnings:

  - The primary key for the `AssignedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,course_id]` on the table `AssignedCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AssignedCourse" DROP CONSTRAINT "AssignedCourse_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AssignedCourse_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedCourse_user_id_course_id_key" ON "AssignedCourse"("user_id", "course_id");
