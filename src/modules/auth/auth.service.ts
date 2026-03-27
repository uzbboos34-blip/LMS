import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthAdminDto } from './dto/create-authAdmin.dto';
import { UserRole } from '@prisma/client';
import { MentorAssistantAuthDto } from './dto/mentor_assistant-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) {}
  async createStudent(payload: CreateAuthDto, filename?: string) {
    const phone = await this.prisma.user.findUnique({
      where: {
        phone: payload.phone,
      },
    });
    if (phone) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ConflictException("Phone already exists");
    }
    const passHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...payload,
        password: passHash,
        image: filename ?? null,
      },
    });
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role
    })
    return {
      success: true,
      message: 'Student created successfully',
      token
    };
  }

  async createMentor(payload: MentorAssistantAuthDto, currentUser: { id: number},filename?: string) {
    
    const admin = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      }
    })
    if (!admin) {
      throw new ForbiddenException("Admin not found")
    }
    const phone = await this.prisma.user.findUnique({
      where: {
        phone: payload.phone,
      },
    });
    if (phone) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ConflictException("Phone already exists");
    }
    const passHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...payload,
        password: passHash,
        image: filename ?? null,
      },
    });
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role
    })
    return {
      success: true,
      message: 'Mentor created successfully',
      token
    };
  }

  async createAdmin(payload: CreateAuthAdminDto, currentUser: { id: number},filename?: string) {

    const admin = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      }
    })

    if (!admin) {
      throw new ForbiddenException("Admin not found")
    }

    if (admin?.isPrimaryAdmin == false) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You don't have permission to create admin")
    }

    if (payload.isPrimaryAdmin == true && admin?.phone != "+998907012161") {
        payload.isPrimaryAdmin = false
    }
    
    const phone = await this.prisma.user.findUnique({
      where: {
        phone: payload.phone,
      },
    });
    if (phone) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ConflictException("Phone already exists");
    }
    
    const passHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...payload,
        password: passHash,
        image: filename ?? null,
      },
    });
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role
    })
    return {
      success: true,
      message: 'Admin created successfully',
      token
    };
  }

  async login(payload: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: payload.phone
      },
    });
    if (!user) {
      throw new NotFoundException('Phone not found');
    }
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Password is incorrect');
    }
    const userActive = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        status: "ACTIVE"
      }
    })
    if (!userActive) {
      throw new NotFoundException('Siz bazada mavjud emassiz register qilinging');
    }
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role
    })
    return {
      success: true,
      message: 'Login successfully',
      token
    };
  }
}
