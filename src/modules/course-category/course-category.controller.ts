import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseIntPipe, Req, Patch, Query } from '@nestjs/common';
import { CourseCategoryService } from './course-category.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';

@Controller('course-category')
@ApiBearerAuth()
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Post("create")
  create(@Body() payload: CreateCourseCategoryDto) {
    return this.courseCategoryService.create(payload);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}` })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get("all")
  findAll(
    @Req() req: Request,
    @Query('search') search?: string,
  ) {
    return this.courseCategoryService.findAll(req['user'], { search });
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.courseCategoryService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateCourseCategoryDto) {
    return this.courseCategoryService.update(id, payload);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Patch('activate/:id')

  activate(@Param('id', ParseIntPipe) id: number) {
    
    return this.courseCategoryService.activate(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoryService.remove(id);
  }
}

