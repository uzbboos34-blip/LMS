import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles';
import { CreateAuthAdminDto } from './dto/create-authAdmin.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { MentorAssistantAuthDto } from './dto/mentor_assistant-auth.dto';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/student")
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example:'+998XXXXXXXXX' },
        password: { type: 'string' },
        fullName: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (req, file, callback) => {
          const filename = Date.now() + '.' + file.originalname.split('.')[1];
          callback(null, filename);
        },
      }),
    }),
  )
  createStudent(
    @Body() payload: CreateAuthDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.createStudent(payload, file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Post("register/mentor")
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example:'+998XXXXXXXXX' },
        password: { type: 'string' },
        fullName: { type: 'string' },
        role: { type: 'string', enum: ['MENTOR', 'ASSISTANT']},
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (req, file, callback) => {
          const filename = Date.now() + '.' + file.originalname.split('.')[1];
          callback(null, filename);
        },
      }),
    }),
  )
  createMentor(
    @Body() payload: MentorAssistantAuthDto,
    @Req() req : Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.createMentor(payload, req['user'] ,file?.filename);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Post("register/admin")
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example:'+998XXXXXXXXX' },
        password: { type: 'string' },
        role: {
        type: 'string',
        enum: ['ADMIN', 'MENTOR', 'STUDENT', 'ASSISTANT'],
      },
        fullName: { type: 'string' },
        isPrimaryAdmin: {type : 'boolean'},
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (req, file, callback) => {
          const filename = Date.now() + '.' + file.originalname.split('.')[1];
          callback(null, filename);
        },
      }),
    }),
  )
  createAdmin(
    @Body() payload: CreateAuthAdminDto,
    @Req() req : Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.createAdmin(payload, req['user'], file?.filename);
  }

  @Post('login')
  login(@Body() payload: LoginAuthDto) {
    return this.authService.login(payload);
  }
}
