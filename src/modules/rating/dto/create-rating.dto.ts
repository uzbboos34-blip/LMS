import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max } from 'class-validator';

export class CreateRatingDto {
    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rate: number;

    @ApiProperty()
    @IsString()
    comment: string;

    @ApiProperty()
    @IsInt()
    course_id: number;
}
