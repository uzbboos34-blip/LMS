/*
  Warnings:

  - The primary key for the `PurchasedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[course_id,user_id]` on the table `PurchasedCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PurchasedCourse" DROP CONSTRAINT "PurchasedCourse_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PurchasedCourse_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "PurchasedCourse_course_id_user_id_key" ON "PurchasedCourse"("course_id", "user_id");
