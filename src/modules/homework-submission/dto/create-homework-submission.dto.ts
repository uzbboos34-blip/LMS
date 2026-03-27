import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeworkSubStatus } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';


export class CreateHomeworkSubmissionDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file?: string;

}

export class CheckHomeworkSubmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(HomeworkSubStatus)
  status?: HomeworkSubStatus;

}


