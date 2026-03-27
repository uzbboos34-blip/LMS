import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile, Patch, ParseIntPipe, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('course')
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.MENTOR}`})
  @Roles(UserRole.MENTOR)
  @Post("create")
  @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          about: { type: 'string' },
          price: { type: 'number' },
          banner: { type: 'string' },
          level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
          category_id: { type: 'number' },
          introVideo: { type: 'string', format: 'binary' },
        },
      },
    })
    @UseInterceptors(
      FileInterceptor('introVideo', {
        storage: diskStorage({
          destination: './src/uploads',
          filename: (req, file, callback) => {
            const filename = Date.now() + '.' + file.originalname.split('.')[1];
            callback(null, filename);
          },
        }),
      }),
    )
  create(@Body() payload: CreateCourseDto, @Req() req: Request , @UploadedFile() file?: Express.Multer.File) {
    return this.courseService.create(payload, req['user'], file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}`})
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT ,UserRole.STUDENT)
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'level', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get("all")
  findAll(
    @Req() req: Request,
    @Query('category_id') category_id?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.courseService.findAll(req['user'], { category_id, level, search });
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.MENTOR}`})
  @Roles(UserRole.MENTOR)
  @Get('my-courses')
  myCourses(@Req() req: Request) {
    return this.courseService.myCourses(req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT}, ${UserRole.STUDENT}`})
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT ,UserRole.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.courseService.findOne(id, req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.ADMIN}, ${UserRole.MENTOR}`})
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          about: { type: 'string' },
          price: { type: 'number' },
          banner: { type: 'string' },
          level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
          category_id: { type: 'number' },
          introVideo: { type: 'string', format: 'binary' },
        },
      },
    })
    @UseInterceptors(
      FileInterceptor('introVideo', {
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
  @Body() payload: UpdateCourseDto, 
  @Req() req: Request, 
  @UploadedFile() file?: Express.Multer.File) {
    return this.courseService.update(id, payload, req['user'], file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.ADMIN}`})
  @Roles(UserRole.ADMIN)
  @Patch('/:id')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.publish(id);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary : `${UserRole.ADMIN}, ${UserRole.MENTOR}`})
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
