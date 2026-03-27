import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateQuestionAnswerDto {

    @ApiProperty()
    @IsNumber()
    question_id: number;
    
    @ApiProperty()
    @IsNumber()
    user_id: number;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file?: string;
}
