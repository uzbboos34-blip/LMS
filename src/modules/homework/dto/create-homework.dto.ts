import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateHomeworkDto {
    @ApiProperty()
    @IsString()
    task: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file?: string;

    @ApiProperty()
    @IsInt()
    lesson_id: number;
}
