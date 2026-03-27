import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Req, ParseIntPipe, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { isPrimaryAdminDto, UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles';
import { UserRole } from '@prisma/client';
import { QueryDto } from './dto/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get("all")
  findAll(@Query() query: QueryDto) {
    return this.userService.findAll(query);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Get('me')
  findMe(@Req() req : Request) {
    return this.userService.findMe(req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Put('me')
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
  update(@Req() req : Request, @Body() payload: UpdateUserDto, @UploadedFile() file?: Express.Multer.File) {
    return this.userService.update(req['user'], payload, file?.filename);
  }

  @Patch("isPrimaryAdmin/:id")
  isPrimaryAdmin(@Param('id', ParseIntPipe) id: number, payload:isPrimaryAdminDto ,@Req() req: Request) {
    return this.userService.isPrimaryAdmin(id, payload ,req['user']);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}, ${UserRole.MENTOR}, ${UserRole.ASSISTANT} ,${UserRole.STUDENT}` })
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
  @Delete('me')
  remove(@Req() req: Request) {
    return this.userService.remove(req['user']);
  }
}
