import { PartialType } from '@nestjs/mapped-types';
import { CreateExamResultDto } from './create-exam-result.dto';

export class UpdateExamResultDto extends PartialType(CreateExamResultDto) {}
