import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PurchasedCourseService } from './purchased-course.service';
import { CreatePurchasedCourseDto } from './dto/create-purchased-course.dto';
import { UpdatePurchasedCourseDto } from './dto/update-purchased-course.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/token.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';

@Controller('purchased-course')
@ApiBearerAuth()
export class PurchasedCourseController {
  constructor(private readonly purchasedCourseService: PurchasedCourseService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT} ` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Post('create')
  create(@Body() payload: CreatePurchasedCourseDto, @Req() req: Request) {
    return this.purchasedCourseService.create(payload, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT} ` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get()
  findAll(@Req() req: Request) {
    return this.purchasedCourseService.findAll(req['user']);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT} ` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.purchasedCourseService.findOne(id, req['user']);
  }
}
