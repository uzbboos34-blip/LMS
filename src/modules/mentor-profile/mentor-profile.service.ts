import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import {UserRole } from '@prisma/client';

@Injectable()
export class MentorProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async create(currentUser: { id: number, role: UserRole }, payload: CreateMentorProfileDto) {
    const profile = await this.prisma.mentorProfile.create({
      data: {
        ...payload,
        userId: currentUser.id
      }
    })
    return {
      success: true,
      message: `${currentUser.role} profile created successfully`,
    }
  }

  async findAll(currentUser: { id: number }, query?: { search?: string }) {
    const where: any = {};

    if (query?.search) {
      where.user = {
        fullName: { contains: query.search, mode: 'insensitive' }
      };
    }

    const admin = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
        status: "ACTIVE"
      }
    })
    if (admin?.isPrimaryAdmin == true) {
      return await this.prisma.mentorProfile.findMany({
        where,
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              role: true,
              status: true,
              image: true
            } 
          },
          telegram: true,
          instagram: true,
          facebook: true,
          linkedin: true,
          github:true,
          website: true
        }
      });
    }

    return await this.prisma.mentorProfile.findMany({
      where: {
        ...where,
        user: {
          ...where.user,
          status: "ACTIVE",
          isPrimaryAdmin: false
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            role: true,
            status: true,
            image: true
          } 
        },
        telegram: true,
        instagram: true,
        facebook: true,
        linkedin: true,
        github:true,
        website: true
      }
    });
  }

  async findMe(currentUser: { id: number }) {
    const profile = await this.prisma.mentorProfile.findFirst({
      where: {
        userId: currentUser.id
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            role: true,
            status: true,
            image: true
          } 
        },
        telegram: true,
        instagram: true,
        facebook: true,
        linkedin: true,
        github:true,
        website: true
      }
    })
    if (!profile) {
      throw new NotFoundException("Siz profile yaratmagansiz")
    }
    return {
      success: true,
      data: profile
    }
  }

  async findOne(id: number) {
    return await this.prisma.mentorProfile.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            role: true,
            status: true,
            image: true
          } 
        },
        telegram: true,
        instagram: true,
        facebook: true,
        linkedin: true,
        github:true,
        website: true
      }
    })
  }

  async update(currentUser: { id: number, role: UserRole }, payload: UpdateMentorProfileDto) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: {
        userId: currentUser.id
      }
    })
    if (!profile) {
      throw new NotFoundException("Siz profile yaratmagansiz")
    }
    await this.prisma.mentorProfile.update({
      where: {
        id: profile.id
      },
      data: {
        ...payload
      }
    })
    return {
      success: true,
      message: `${currentUser.role} profile created successfully`
    }
  }

  async remove(currentUser: { id: number, role: UserRole }) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: {
        userId: currentUser.id
      }
    })
    if (!profile) {
      throw new NotFoundException("Siz profile yaratmagansiz")
    }
    await this.prisma.user.update({
      where:{
        id: currentUser.id
      },
      data: {
        status: "INACTIVE",
        phone: ''
      }
    })
    return {
      success: true,
      message: `${currentUser.role} profile created successfully`
    }
  }
}
