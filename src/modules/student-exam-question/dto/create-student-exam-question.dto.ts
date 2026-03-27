import { ApiProperty } from '@nestjs/swagger';
import { ExamAnswer } from '@prisma/client';
import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';


export class CreateStudentExamQuestionDto {
    @ApiProperty()
    @IsNumber()
    exam_id: number;

    @ApiProperty({ enum: ExamAnswer })
    @IsEnum(ExamAnswer)
    @IsNotEmpty()
    answer: ExamAnswer;
}
