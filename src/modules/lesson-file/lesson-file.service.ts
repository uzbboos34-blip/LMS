import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonFileDto } from './dto/create-lesson-file.dto';
import { UpdateLessonFileDto } from './dto/update-lesson-file.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonFileService {
  constructor(private readonly prisma: PrismaService) { }
  async create(payload: CreateLessonFileDto, currentUser: { id: number }, filename?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: payload.lesson_id },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.section.course.mentor_id != currentUser.id) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("Only mentor can add files");
    }

    await this.prisma.lessonFile.create({
      data: {
        ...payload,
        file: filename ?? null
      }
    })
    return {
      success: true,
      message: "File created successfully",
    }

  }

  async findAll(lesson_id: number, currentUser: { id: number, role: UserRole }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lesson_id },
      select: {
        section: {
          select: {
            course_id: true,
            course: {
              select: {
                mentor_id: true
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (currentUser.role === UserRole.ADMIN) {
      return this.prisma.lessonFile.findMany({
        where: { lesson_id }
      });
    }

    const hasAccess = await this.prisma.course.findFirst({
      where: {
        id: lesson.section.course_id,
        OR: [
          { mentor_id: currentUser.id },
          { assignedCourses: { some: { user_id: currentUser.id, isDeleted: false } } },
          { purchasedCourses: { some: { user_id: currentUser.id } } }
        ]
      }
    });

    if (!hasAccess) {
      throw new ForbiddenException("You cannot access files");
    }

    return await this.prisma.lessonFile.findMany({
      where: { lesson_id }
    });
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.lessonFile.findUnique({
        where: { id },
        select: {
          id: true,
          file: true,
          note: true,
          lesson: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }

    const course = file.lesson.section.course;

    const hasAccess = await this.prisma.course.findFirst({
      where: {
        id: course.id,
        OR: [
          { mentor_id: currentUser.id },
          { assignedCourses: { some: { user_id: currentUser.id, isDeleted: false } } },
          { purchasedCourses: { some: { user_id: currentUser.id } } }
        ]
      }
    });

    if (!hasAccess) {
      throw new ForbiddenException("You cannot access this file");
    }

    return await this.prisma.lessonFile.findUnique({
      where: { id },
      select: {
        id: true,
        file: true,
        note: true,
        lesson: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async update(id: number, payload: UpdateLessonFileDto, currentUser: { id: number }, filename?: string) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!file) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("File not found");
    }

    if (file.lesson.section.course.mentor_id != currentUser.id) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("Only mentor can update files"); 
    }
    let fileName = file.file
    if (filename) {
      const filePath = join(process.cwd(), 'src', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fileName = filename
    }

    await this.prisma.lessonFile.update({
      where: { id },
      data: {
        note: payload.note,
        file: fileName ?? null
      }
    })
  }
  async remove(id: number, currentUser: { id: number, role: UserRole }) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    if (file.lesson.section.course.mentor_id != currentUser.id) {
      throw new ForbiddenException("Only mentor can delete files");
    }

    await this.prisma.lessonFile.update({
      where: { id },
      data: {
        isDeleted: true
      }
    })
    return {
      success: true,
      message: "File deleted successfully",
    }
  }
}
