import { Module } from '@nestjs/common';
import { SectionLessonService } from './section-lesson.service';
import { SectionLessonController } from './section-lesson.controller';

@Module({
  controllers: [SectionLessonController],
  providers: [SectionLessonService],
})
export class SectionLessonModule {}
