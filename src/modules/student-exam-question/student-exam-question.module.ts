import { Module } from '@nestjs/common';
import { StudentExamQuestionService } from './student-exam-question.service';
import { StudentExamQuestionController } from './student-exam-question.controller';

@Module({
  controllers: [StudentExamQuestionController],
  providers: [StudentExamQuestionService],
})
export class StudentExamQuestionModule {}
