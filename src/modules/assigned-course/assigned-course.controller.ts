import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { AssignedCourseService } from './assigned-course.service';
import { CreateAssignedCourseDto } from './dto/create-assigned-course.dto';
import { UpdateAssignedCourseDto } from './dto/update-assigned-course.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/token.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { QueryDto } from './dto/quare.dto';
@Controller('assigned-course')
@ApiBearerAuth()
export class AssignedCourseController {
  constructor(private readonly assignedCourseService: AssignedCourseService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() payload: CreateAssignedCourseDto, @Req() req:Request) {
    return this.assignedCourseService.create(payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get("all") 
  findAll(@Query () query: QueryDto) {
    return this.assignedCourseService.findAll(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ASSISTANT}` })
  @Roles(UserRole.ASSISTANT)
  @Get("me")
  findMe(@Req() req:Request) {
    return this.assignedCourseService.findMe(req['user']);
  }

  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignedCourseService.findOne(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateAssignedCourseDto) {
    return this.assignedCourseService.update(id, payload);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assignedCourseService.remove(id);
  }
}
