import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { LessonViewService } from './lesson-view.service';
import { CreateLessonViewDto } from './dto/create-lesson-view.dto';
import { UpdateLessonViewDto } from './dto/update-lesson-view.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';

@Controller('lesson-view')
@ApiBearerAuth()  
export class LessonViewController {
  constructor(private readonly lessonViewService: LessonViewService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Post()
  create(@Body() payload: CreateLessonViewDto, @Req() req: Request) {
    return this.lessonViewService.create(payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN ,UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get()
  findAll(
    @Req() req: Request,
    @Query('lesson_id') lesson_id?: string,
  ) {
    return this.lessonViewService.findAll(req['user'], { lesson_id });
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN ,UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('lesson/:id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.lessonViewService.findOne(id, req['user']);
  }
}
