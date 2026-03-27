import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, ParseIntPipe } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { text } from 'stream/consumers';

@Controller('homework')
@ApiBearerAuth()
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) { }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        task: { type: 'string' },
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
  create(@Body() payload: CreateHomeworkDto, @Req() req: Request ,@UploadedFile() file?: Express.Multer.File) {
    return this.homeworkService.create(payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get("lessons/:lesson_id/homeworks")
  findAll(@Param('lesson_id', ParseIntPipe) lesson_id: number, @Req() req: Request) {
    return this.homeworkService.findAll(lesson_id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('homeworks/:id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworkService.findOne(id, req['user']);
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
        task: { type: 'string' },
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
    @Body() payload: UpdateHomeworkDto, 
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File) {
    return this.homeworkService.update(id, payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworkService.remove(id, req['user']);
  }
}
