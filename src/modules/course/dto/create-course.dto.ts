import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  about: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  banner: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  introVideo?: string;

  @ApiProperty({
    enum: CourseLevel,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  category_id: number;
}
