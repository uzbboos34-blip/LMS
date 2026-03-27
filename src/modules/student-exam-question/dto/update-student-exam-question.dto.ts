import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentExamQuestionDto } from './create-student-exam-question.dto';

export class UpdateStudentExamQuestionDto extends PartialType(CreateStudentExamQuestionDto) {}
