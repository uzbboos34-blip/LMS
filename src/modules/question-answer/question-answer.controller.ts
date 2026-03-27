import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, Req, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { QuestionAnswerService } from './question-answer.service';
import { CreateQuestionAnswerDto } from './dto/create-question-answer.dto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('question-answer')
@ApiBearerAuth()
export class QuestionAnswerController {
  constructor(private readonly questionAnswerService: QuestionAnswerService) { }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN} ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @Post(':question_id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
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
  create(@Param('question_id', ParseIntPipe) question_id: number, @Body() payload: CreateQuestionAnswerDto, @Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    return this.questionAnswerService.create(question_id, payload, req['user'], file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN} ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @Get('/courses/:course_id')
  findByCourse(
    @Param('course_id', ParseIntPipe) course_id: number,
    @Req() req: Request
  ) {
    return this.questionAnswerService.findByCourse(course_id, req['user']);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN} ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @Get(':question_id')
  findOne(@Param('question_id', ParseIntPipe) question_id: number, @Req() req: Request) {
    return this.questionAnswerService.findOne(question_id, req['user']);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN} ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
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
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateQuestionAnswerDto, @Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    return this.questionAnswerService.update(id, payload, req['user'], file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN} ${UserRole.MENTOR}, ${UserRole.ASSISTANT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.questionAnswerService.remove(id, req['user']);
  }
}
