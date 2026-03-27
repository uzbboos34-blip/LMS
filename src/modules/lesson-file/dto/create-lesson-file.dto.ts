import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateLessonFileDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file?: string;

    @ApiProperty()
    @IsString()
    note: string;

    @ApiProperty()
    @IsInt()
    lesson_id: number;
}
