import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';

enum ExamAnswer {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  variantA: string;

  @ApiProperty()
  @IsString()
  variantB: string;

  @ApiProperty()
  @IsString()
  variantC: string;

  @ApiProperty()
  @IsString()
  variantD: string;

  @ApiProperty()
  @IsEnum(ExamAnswer)
  answer: ExamAnswer;

  @ApiProperty()
  @IsNumber()
  section_id: number;
}
