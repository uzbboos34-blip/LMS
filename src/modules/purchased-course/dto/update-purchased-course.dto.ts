import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchasedCourseDto } from './create-purchased-course.dto';

export class UpdatePurchasedCourseDto extends PartialType(CreatePurchasedCourseDto) {}
