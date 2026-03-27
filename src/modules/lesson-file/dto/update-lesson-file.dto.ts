import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonFileDto } from './create-lesson-file.dto';

export class UpdateLessonFileDto extends PartialType(CreateLessonFileDto) {}
