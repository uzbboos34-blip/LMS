import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionLessonDto } from './create-section-lesson.dto';

export class UpdateSectionLessonDto extends PartialType(CreateSectionLessonDto) {}
