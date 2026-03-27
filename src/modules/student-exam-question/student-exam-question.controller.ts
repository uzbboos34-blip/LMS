import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { StudentExamQuestionService } from './student-exam-question.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { CreateStudentExamQuestionDto } from './dto/create-student-exam-question.dto';

@Controller('student-exam-question')
@ApiBearerAuth()
export class StudentExamQuestionController {
  constructor(private readonly studentExamQuestionService: StudentExamQuestionService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.MENTOR},${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Post('/sections/:section_id')
  create(
    @Param('section_id', ParseIntPipe) section_id: number,
    @Body() payload:CreateStudentExamQuestionDto,
    @Req() req: Request
  ) {
    return this.studentExamQuestionService.create(section_id, payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN},${UserRole.MENTOR},${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @Get('/sections/:section_id/exam/submissions/:user_id')
  findAll(@Param('section_id', ParseIntPipe) section_id: number,@Param('user_id', ParseIntPipe) user_id: number ,@Req() req: Request) {
    return this.studentExamQuestionService.findAll(section_id, user_id,req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR},${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('/sections/:section_id/exam/result')
  findMyExam(@Param('section_id', ParseIntPipe) section_id: number, @Req() req: Request) { 
    return this.studentExamQuestionService.findMyExam(section_id, req['user']);
  }
}
