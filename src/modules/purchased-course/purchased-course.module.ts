import { Module } from '@nestjs/common';
import { PurchasedCourseService } from './purchased-course.service';
import { PurchasedCourseController } from './purchased-course.controller';

@Module({
  controllers: [PurchasedCourseController],
  providers: [PurchasedCourseService],
})
export class PurchasedCourseModule {}
