import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ExamResultService } from './exam-result.service';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
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
  @ApiOperation({ summary: ` ${UserRole.ADMIN},${UserRole.MENTOR}` })
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @Post()
  create(@Body() payload: CreateExamResultDto, @Req() req: Request) {
    return this.examResultService.create(payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN},${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':section_id')
  findAll(@Param('section_id', ParseIntPipe) section_id: number, @Req() req: Request) {
    return this.examResultService.findAll(section_id, req['user']);
  }
}
