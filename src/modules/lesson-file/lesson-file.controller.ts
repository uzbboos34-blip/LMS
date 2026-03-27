import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { LessonFileService } from './lesson-file.service';
import { CreateLessonFileDto } from './dto/create-lesson-file.dto';
import { UpdateLessonFileDto } from './dto/update-lesson-file.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('lesson-file')
@ApiBearerAuth()
export class LessonFileController {
  constructor(private readonly lessonFileService: LessonFileService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN, UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          note: { type: 'string' },
          lesson_id: { type: 'number' },
          file: { type: 'string', format: 'binary' },       
        },
      },
    })
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './src/uploads',
          filename: (req, file, callback) => {
            const filename = Date.now() + '.' + file.originalname.split('.')[1];
            callback(null, filename);
          },
        }),
      }),
    )
  create(@Body() payload: CreateLessonFileDto, @Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    return this.lessonFileService.create(payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN, UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(":lesson_id")
  findAll(@Param('lesson_id', ParseIntPipe) lesson_id: number, @Req() req: Request) {
    return this.lessonFileService.findAll(lesson_id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN, UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.lessonFileService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN, UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          note: { type: 'string' },
          lesson_id: { type: 'number' },
          file: { type: 'string', format: 'binary' },       
        },
      },
    })
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './src/uploads',
          filename: (req, file, callback) => {
            const filename = Date.now() + '.' + file.originalname.split('.')[1];
            callback(null, filename);
          },
        }),
      }),
    )
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() payload: UpdateLessonFileDto, 
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.lessonFileService.update(+id, payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN, UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.lessonFileService.remove(id, req['user']);
  }
}
