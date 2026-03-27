import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}
  async create(payload: CreateLessonDto, filename: string) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: {
        id: payload.section_id
      }
    })
    if (!section) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Section not found")
    }

    await this.prisma.lesson.create({
      data: {
        ...payload,
        video: filename ?? null
      }
    }) 

    return {
      success: true,
      message: "Lesson created successfully",
    }
  }

  async findAll(id: number, currentUser: { id: number , role: UserRole}) {
    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.lesson.findMany({
        where: {
          section_id: id
        },
        select: {
          id: true,
          name: true,
          about: true,
          video: true,
          isDeleted: true
        }
      })
    }
    const section = await this.prisma.sectionLesson.findUnique({
      where: {
        id,
        isDeleted: false
      },
      select: {
        course: {
          select: {
            mentor_id: true,
            assignedCourses: {
              select: {
                user_id: true
              }
            }
          }
        }
      }
    })
    if (!section) {
      throw new NotFoundException("Section not found")
    }

    if (section.course.mentor_id == currentUser.id) {
      return await this.prisma.lesson.findMany({
        where: {
          section_id: id,
          isDeleted: false
        },
        select: {
          id: true,
          name: true,
          about: true,
          video: true
        }
      })
    }

    if (section.course.assignedCourses.some(course => course.user_id == currentUser.id)) {
      return await this.prisma.lesson.findMany({
        where: {
          section_id: id,
          isDeleted: false
        },
        select: {
          id: true,
          name: true,
          about: true,
          video: true
        }
      })
    }

    

    return await this.prisma.lesson.findMany({
      where: {
        section_id: id,
        section: {
          course: {
            purchasedCourses: {
              some: {
                user_id: currentUser.id
              }
            }
          }
        },
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        about: true,
        video: true
      }
    })
  }

  async findOne(id: number, currentUser: { id: number , role: UserRole}) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        about: true,
        video: true
      }
    })
    if (!lesson) {
      throw new NotFoundException("Lesson not found")
    }
    return lesson
  }

  async update(id: number, payload: UpdateLessonDto, filename: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!lesson) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Lesson not found")
    }

    let videoFile = lesson.video
    if (filename) {
      const filePath = join(process.cwd(), 'src', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      videoFile = filename
    }
    await this.prisma.lesson.update({
      where: {
        id,
        isDeleted: false
      },
      data: {
        ...payload,
        video: videoFile
      }
    })

    return {
      success: true,
      message: "Lesson updated successfully",
    }
  }
  
  async isDeleteFalse(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id
      }
    })
    if (!lesson) {
      throw new NotFoundException("Lesson not found")
    }
    await this.prisma.lesson.update({
      where: {
        id,
        isDeleted: true
      },
      data: {
        isDeleted: false
      }
    })
    return {
      success: true,
      message: "Lesson deleted successfully",
    }
  }

  async remove(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!lesson) {
      throw new NotFoundException("Lesson not found")
    }
    await this.prisma.lesson.update({
      where: {
        id,
        isDeleted: false
      },
      data: {
        isDeleted: true
      }
    })
    return {
      success: true,
      message: "Lesson deleted successfully", 
    }
  }
}
