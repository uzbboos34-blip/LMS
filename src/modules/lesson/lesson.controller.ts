import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Patch, ParseIntPipe, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('lesson')
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  @ApiConsumes('multipart/form-data')
      @ApiBody({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            about: { type: 'string' },
            section_id: { type: 'number' },
            video: { type: 'string', format: 'binary' },
          },
        },
      })
      @UseInterceptors(
        FileInterceptor('video', {
          storage: diskStorage({
            destination: './src/uploads',
            filename: (req, file, callback) => {
              const filename = Date.now() + '.' + file.originalname.split('.')[1];
              callback(null, filename);
            },
          }),
        }),
      )
  create(@Body() payload: CreateLessonDto, @UploadedFile() file: Express.Multer.File) {
    return this.lessonService.create(payload, file.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR},${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(":section_id")
  findAll(@Param('section_id', ParseIntPipe) section_id: number, @Req() req: Request) {
    return this.lessonService.findAll(section_id,req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR},${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.lessonService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Put(':id')
    @ApiConsumes('multipart/form-data')
      @ApiBody({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            about: { type: 'string' },
            video: { type: 'string', format: 'binary' },
          },
        },
      })
      @UseInterceptors(
        FileInterceptor('video', {
          storage: diskStorage({
            destination: './src/uploads',
            filename: (req, file, callback) => {
              const filename = Date.now() + '.' + file.originalname.split('.')[1];
              callback(null, filename);
            },
          }),
        }),
      )
  update(@Param('id', ParseIntPipe) id: number, @Body() paload: UpdateLessonDto, @UploadedFile() file: Express.Multer.File) {
    return this.lessonService.update(id, paload, file.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Patch('delete-false/:id')
  isDeleteFalse(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.isDeleteFalse(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete('delete-true/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.remove(id);
  }
}
