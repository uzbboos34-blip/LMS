import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateAssignedCourseDto {

    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsInt()
    course_id: number;
}
