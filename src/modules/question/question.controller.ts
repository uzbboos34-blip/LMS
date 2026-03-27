import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseIntPipe, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('question')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) { }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        course_id: { type: 'number' },
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
  create(@Body() payload: CreateQuestionDto, @Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    return this.questionService.create(payload, req['user'], file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN},${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @ApiQuery({ name: 'course_id', required: false, type: Number })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get()
  findAll(
    @Req() req: Request,
    @Query('course_id') course_id?: string,
    @Query('read') read?: string,
  ) {
    return this.questionService.findAll(req['user'], { course_id, read });
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN},${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.questionService.findOne(id, req['user']);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: ` ${UserRole.ADMIN},${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT, UserRole.STUDENT)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.questionService.remove(id, req['user']);
  }
}
