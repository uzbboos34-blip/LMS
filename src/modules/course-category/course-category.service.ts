import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class CourseCategoryService {
  constructor(private prisma: PrismaService) {}
  async create(payload: CreateCourseCategoryDto) {
    const courseCategory = await this.prisma.courseCategory.create({
      data: {
        name: payload.name,
      },
    })
    return {
      success: true,
      message: "Course category created successfully",
    }
  }

  async findAll(currentUser: { id: number, role: UserRole }, query?: { search?: string }) {
    const where: any = {};

    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.courseCategory.findMany({ where });
    }

    where.status = "ACTIVE";

    return await this.prisma.courseCategory.findMany({ where });
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const courseCategory = await this.prisma.courseCategory.findUnique({
      where: {
        id
      }
    })
    if (!courseCategory) {
      throw new NotFoundException("Course category not found")
    }
    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.courseCategory.findUnique({
        where: {
          id
        }
      })
    }
    return await this.prisma.courseCategory.findUnique({
      where: {
        id,
        status: "ACTIVE"
      }
    })
  }

  async update(id: number, payload: UpdateCourseCategoryDto) {
    const courseCategory = await this.prisma.courseCategory.findUnique({
      where: {
        id
      }
    })
    if (!courseCategory) {
      throw new NotFoundException("Course category not found")
    }
    return await this.prisma.courseCategory.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
  }

  async activate(id: number) {
    const courseCategory = await this.prisma.courseCategory.findUnique({
      where: {
        id
      }
    })
    if (!courseCategory) {
      throw new NotFoundException("Course category not found")
    }
    await this.prisma.courseCategory.update({
      where: {
        id
      },
      data: {
        status: "ACTIVE"
      }
    })
    return {
      success: true,
      message: "Course category activated successfully",
    }
  }

  async remove(id: number) {
    const courseCategory = await this.prisma.courseCategory.findUnique({
      where: {
        id
      }
    })
    if (!courseCategory) {
      throw new NotFoundException("Course category not found")
    }
    const courseCategoryDelete = await this.prisma.courseCategory.update({
      where: {
        id
      },
      data: {
        status: "INACTIVE"
      }
    })
    return {
      success: true,
      message: "Course category deleted successfully",
    }
  }
}
