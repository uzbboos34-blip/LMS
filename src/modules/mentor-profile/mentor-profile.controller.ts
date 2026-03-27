import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { MentorProfileService } from './mentor-profile.service';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('mentor-profile')
@ApiBearerAuth()
export class MentorProfileController {
  constructor(private readonly mentorProfileService: MentorProfileService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @Post('me') 
  create(@Req() req: Request, @Body() payload: CreateMentorProfileDto) {
    return this.mentorProfileService.create(req['user'], payload);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Roles(UserRole.ADMIN)
  @Get("all")
  findAll(
    @Req() req: Request,
    @Query('search') search?: string,
  ) {
    return this.mentorProfileService.findAll(req['user'], { search });
  }
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @Get('me')
  findMe(@Req() req: Request) {
    return this.mentorProfileService.findMe(req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mentorProfileService.findOne(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @Put('me')
  update(@Req() req: Request, @Body() payload: UpdateMentorProfileDto) {
    return this.mentorProfileService.update(req['user'], payload);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @Delete('me')
  remove(@Req() req: Request) {
    return this.mentorProfileService.remove(req['user'] );
  }
}
