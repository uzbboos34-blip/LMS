import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty()
    @IsNumber()
    course_id: number;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file?: string;
}
