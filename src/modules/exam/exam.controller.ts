import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';

@Controller('exam')
@ApiBearerAuth()
export class ExamController {
  constructor(private readonly examService: ExamService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary:`${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  create(@Body() payload: CreateExamDto, @Req() req: Request) {
    return this.examService.create(payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary:`${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get("section/:section_id")
  findAll(@Param('section_id', ParseIntPipe) section_id: number, @Req() req: Request) {
    return this.examService.findAll(section_id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary:`${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary:`${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateExamDto, @Req() req: Request) {
    return this.examService.update(id, payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary:`${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.examService.remove(id, req['user']);
  }
}
