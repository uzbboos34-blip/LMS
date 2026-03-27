-- CreateTable
CREATE TABLE "CourseAssistant" (
    "course_id" INTEGER NOT NULL,
    "assistant_id" INTEGER NOT NULL,

    CONSTRAINT "CourseAssistant_pkey" PRIMARY KEY ("course_id","assistant_id")
);

-- AddForeignKey
ALTER TABLE "CourseAssistant" ADD CONSTRAINT "CourseAssistant_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAssistant" ADD CONSTRAINT "CourseAssistant_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
