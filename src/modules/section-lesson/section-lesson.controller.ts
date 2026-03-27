import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, ParseIntPipe, Patch } from '@nestjs/common';
import { SectionLessonService } from './section-lesson.service';
import { CreateSectionLessonDto } from './dto/create-section-lesson.dto';
import { UpdateSectionLessonDto } from './dto/update-section-lesson.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';

@Controller('section-lesson')
@ApiBearerAuth()
export class SectionLessonController {
  constructor(private readonly sectionLessonService: SectionLessonService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() payload: CreateSectionLessonDto) {
    return this.sectionLessonService.create(payload);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('courses/:course_id/sections')
  findSectionsByCourse(@Param('course_id', ParseIntPipe) course_id: number, @Req() req: Request) {
    return this.sectionLessonService.findSectionsByCourse(course_id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.sectionLessonService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateSectionLessonDto) {
    return this.sectionLessonService.update(id, payload);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Patch('delete-false/:id')
  isDeleteFalse(@Param('id', ParseIntPipe) id: number) {
    return this.sectionLessonService.isDeleteFalse(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Delete('delete-true/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionLessonService.remove(id);
  }
}
