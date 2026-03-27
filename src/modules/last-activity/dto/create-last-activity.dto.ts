import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLastActivityDto {
    @ApiProperty()
    @IsInt()
    course_id: number;

    @ApiProperty()
    @IsInt()
    section_id: number;

    @ApiProperty()
    @IsInt()
    lesson_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    url?: string;
}
