import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonViewDto } from './create-lesson-view.dto';

export class UpdateLessonViewDto extends PartialType(CreateLessonViewDto) {}
