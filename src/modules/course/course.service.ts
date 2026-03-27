import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateCourseDto, currentUser: { id: number, role: UserRole }, filename?: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: {
        id: payload.category_id
      }
    })
    if (!category) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Category not found")
    }
    const course = await this.prisma.course.create({
      data: {
        ...payload,
        introVideo: filename ?? null,
        mentor_id: currentUser.id
      }
    })
    return {
      success: true,
      message: "Course created successfully",
    }
  }

  async findAll(currentUser: { id: number, role: UserRole }, query?: { category_id?: string, level?: string, search?: string }) {
    const where: any = {};

    if (query?.category_id) {
      where.category_id = +query.category_id;
    }

    if (query?.level) {
      where.level = query.level.toUpperCase();
    }

    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (currentUser.role == "ADMIN") {
      return await this.prisma.course.findMany({
        where,
        select: {
          id: true,
          name: true,
          about: true,
          price: true,
          banner: true,
          introVideo: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
              image: true
            }
          }
        }
      })
    }
    // Default for others: only published courses
    where.published = true;
    where.mentor = { status: "ACTIVE" };

    return await this.prisma.course.findMany({
      where,
      select: {
        id: true,
        name: true,
        about: true,
        price: true,
        banner: true,
        introVideo: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            image: true
          }
        }
      }
    })
  }

  async myCourses(currentUser: { id: number }) {
    return await this.prisma.course.findMany({
      where: {
        mentor_id: currentUser.id
      },
      select: {
        id: true,
        name: true,
        about: true,
        price: true,
        banner: true,
        introVideo: true  
      }
    })
  }

  async findOne(id: number, currentUser : { id: number, role: UserRole }) {
  const course = await this.prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      about: true,
      price: true,
      banner: true,
      introVideo: true,
      published: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
          image: true
        }
      }
    }
  });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  if (currentUser.role == 'ADMIN') {
    return course;
  }

  if (currentUser.role == 'MENTOR') {
    if (course.mentor.id == currentUser.id) {
      return course;
    }

    if (course.published == true) {
      return course;
    }

    throw new ForbiddenException();
  }

  if (course.published != true) {
    throw new NotFoundException();
  }

  return course;
}
  async update(
    id: number, 
    payload: UpdateCourseDto, 
    currentUser: { id: number, role: UserRole},
    filename?: string  
    ) {

    const course = await this.prisma.course.findUnique({
      where: {
        id
      }
    })
    if (!course) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Course not found")
    }

    let video = course.introVideo
        if (filename) {
          const filePath = join(process.cwd(), 'src', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          video = filename
        }
    if (currentUser.role == "ADMIN") {
      const updatedCourse = await this.prisma.course.update({
        where: {
          id
        },
        data: {
          ...payload,
          introVideo: video ?? null
        }
      })

      if (course.mentor_id != currentUser.id) {
        throw new ForbiddenException("You don't have permission to update this course")
      }

      if (course.published == true) {
        throw new ForbiddenException("You can't update a published course")
      }

      if (!payload.price) {
        throw new ForbiddenException("Only price can be updated")
      }

      await this.prisma.course.update({
        where: {
          id
        },
        data: {
          ...payload,
          introVideo: video ?? null
        }
      })
      return {
        success: true,
        message: "Course updated successfully",
      }
    }
  }

  async publish(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    await this.prisma.course.update({
      where: {
        id
      },
      data: {
        published: true
      }
    })
    return {
      success: true,
      message: "Course published successfully",
    }
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({
      where: {
        id
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    await this.prisma.course.update({
      where: {
        id
      },
      data: {
        published: false
      }
    })
    return {
      success: true,
      message: "Course deleted successfully",
    }
  }
}
