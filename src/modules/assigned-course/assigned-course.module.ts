import { Module } from '@nestjs/common';
import { AssignedCourseService } from './assigned-course.service';
import { AssignedCourseController } from './assigned-course.controller';

@Module({
  controllers: [AssignedCourseController],
  providers: [AssignedCourseService],
})
export class AssignedCourseModule {}
