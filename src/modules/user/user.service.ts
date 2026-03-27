import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { isPrimaryAdminDto, UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { QueryDto } from './dto/query.dto';
import fs from "fs";
import { join } from "path";
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) {}
  async findAll(query: QueryDto) {
    const where : any = {};
    if (query.fullName) {
      where.fullName = {
        contains: query.fullName,
        mode: 'insensitive'
      } 

    }
    if (query.status) {
      where.status = query.status
    }
    if (query.role) {
      where.role = query.role
    }
    const users =  await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        image: true
      }
    });
    return {
      success: true,
      data: users
    }
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        image: true
      }
    })

    return {
      success: true,
      data: user
    }

  }

  async findMe(currentUser: { id: number }) {
    const userFind = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      },


      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        image: true
      }
    })
    return {
      success: true,
      data: userFind
    }
  }

  async update(currentUser: { id: number }, payload: UpdateUserDto, filename?: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      }
    })
    if (!user) {
      throw new NotFoundException("User not found")
    }
    if (payload.phone) {
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
        throw new ConflictException("Phone already exists")
      }
    }
    let photo = user.image
    if (filename) {
      const filePath = join(process.cwd(), 'src', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      photo = filename
    }

    if (payload.password) {
      const passHash = await bcrypt.hash(payload.password, 10);
      payload.password = passHash
    }

    const userUpdate = await this.prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        ...payload,
        image: photo ?? null
      }
    })
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role
    })
    return {
      success: true,
      message: "User updated successfully",
      token
    }
    
  }

  async isPrimaryAdmin(id: number, payload: isPrimaryAdminDto, currentUser: { id: number, phone: string }) {
    if (currentUser.phone != "+998907012161") {
      throw new ForbiddenException("You don't have permission to create admin")
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    })
    if (!user) {
      throw new NotFoundException("User not found")
    }
    await this.prisma.user.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
    return {
      success: true,
      message: "User updated successfully"
    }
  }

  async remove(currentUser: { id: number }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      }
    })
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const userDelete = await this.prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        status: "INACTIVE",
        phone: ''
      }
    })
    if (userDelete.image) {
      const filePath = join(process.cwd(), 'src', 'uploads', userDelete.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      userDelete.image = null
    }

    
    return {
      success: true,
      message: "User deleted successfully"
    }
  }
}
