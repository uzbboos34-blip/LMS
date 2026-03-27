import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, ParseIntPipe, Patch } from '@nestjs/common';
import { HomeworkSubmissionService } from './homework-submission.service';
import { CheckHomeworkSubmissionDto, CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { text } from 'stream/consumers';

@Controller('homework-submission')
@ApiBearerAuth()
export class HomeworkSubmissionController {
  constructor(private readonly homeworkSubmissionService: HomeworkSubmissionService) { }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.MENTOR},${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Post('homeworks/:id/submissions')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        reason: { type: 'string' },
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
  create(@Param('id', ParseIntPipe) homework_id: number, @Body() payload: CreateHomeworkSubmissionDto, @Req() req: Request ,@UploadedFile() file?: Express.Multer.File) {
    return this.homeworkSubmissionService.create( homework_id ,payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN},${UserRole.MENTOR},${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('homeworks/:id/submissions')
  findAll(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworkSubmissionService.findAll(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN},${UserRole.MENTOR},${UserRole.ASSISTANT},${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.homeworkSubmissionService.findOne(id, req['user']);
  } 
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        reason: { type: 'string' },
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
    @Body() payload: UpdateHomeworkSubmissionDto, @Req() req: Request, 
    @UploadedFile() file?: Express.Multer.File) {
    return this.homeworkSubmissionService.update(id, payload, req['user'], file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @Patch('/submissions/:id/check')
  check(@Param('id', ParseIntPipe) id: number, @Body() payload: CheckHomeworkSubmissionDto, @Req() req: Request) {
    return this.homeworkSubmissionService.check(id, payload ,req['user']);
  }

}
