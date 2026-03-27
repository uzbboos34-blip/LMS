import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignedCourseDto } from './create-assigned-course.dto';

export class UpdateAssignedCourseDto extends PartialType(CreateAssignedCourseDto) {}
