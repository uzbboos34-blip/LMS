import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean } from 'class-validator';

export class CreateLessonViewDto {
    @ApiProperty()
    @IsInt()
    lesson_id: number;
    
    @ApiProperty()
    @IsBoolean()
    view: boolean;
}
