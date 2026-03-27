import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ExamResultService } from './exam-result.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';

@Controller('exam-result')
@ApiBearerAuth()
export class ExamResultController {
  constructor(private readonly examResultService: ExamResultService) { }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('student/exam/:section_id/result')
  getMyResult(@Param('section_id', ParseIntPipe) section_id: number, @Req() req: Request) {
    return this.examResultService.getMyResult(section_id, req['user']);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @Get('/sections/:id/results')
  getAllResults(@Param('id') id: number, @Req() req) {
    return this.examResultService.getAllResults(id, req.user);
  }
}
