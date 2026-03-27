import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaidVia } from '@prisma/client';
import { IsInt, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreatePurchasedCourseDto {
    @ApiProperty()
    @IsInt()
    course_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiProperty()
    @IsEnum(PaidVia)
    paidVia: PaidVia;
}
