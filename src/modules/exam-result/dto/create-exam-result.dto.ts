import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';

export class CreateExamResultDto {
  @ApiProperty()
  @IsNumber()
  section_id: number;

  @ApiProperty()
  @IsNumber()
  user_id: number;

  @ApiProperty()
  @IsBoolean()
  passed: boolean;

  @ApiProperty()
  @IsNumber()
  corrects: number;

  @ApiProperty()
  @IsNumber()
  wrongs: number;
}
