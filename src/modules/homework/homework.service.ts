import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { UserRole } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) { }
  async create(payload: CreateHomeworkDto, currentUser: { id: number }, filename?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id: payload.lesson_id,
        isDeleted: false
      },
      include: {
        section: {
          include: {
            course: true
          }
        }
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

    if (lesson.section.course.mentor_id != currentUser.id) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Only mentor can add homework")
    }

    await this.prisma.homework.create({
      data: {
        ...payload,
        file: filename ?? null
      }
    })

    return {
      success: true,
      message: "Homework created successfully",
    }

  }
  async findAll(lesson_id: number, currentUser: { id: number, role: UserRole }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lesson_id },
      select: {
        section: {
          select: {
            course_id: true
          }
        }
      }
    });

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.homework.findMany({
        where: { lesson_id },
        select: {
          id: true,
          task: true,
          file: true,
          lesson: {
            select: {
              id: true,
              name: true
            }
          }
        }
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
      throw new ForbiddenException("You cannot access homework");
    }

    

    return await this.prisma.homework.findMany({
      where: {
        lesson_id,
        isDeleted: false
      },
      select: {
        id: true,
        task: true,
        file: true,
        lesson: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const hw = await this.prisma.homework.findUnique({
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

    if (!hw) {
      throw new NotFoundException("Homework not found");
    }

    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.homework.findUnique({
        where: { id },
        select: {
          id: true,
          task: true,
          file: true,
          lesson: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }
    const hasAccess = await this.prisma.course.findFirst({
      where: {
        id: hw.lesson.section.course_id,
        OR: [
          { mentor_id: currentUser.id },
          { assignedCourses: { some: { user_id: currentUser.id, isDeleted: false } } },
          { purchasedCourses: { some: { user_id: currentUser.id } } }
        ]
      }
    });

    if (!hasAccess) {
      throw new ForbiddenException("You cannot access this homework");
    }

    if (hw.isDeleted) {
      throw new NotFoundException("Homework not found");
    }

    return await this.prisma.homework.findUnique({
      where: { id },
      select: {
        id: true,
        task: true,
        file: true,
        lesson: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
  async update(id: number, payload: UpdateHomeworkDto, currentUser: { id: number, role: UserRole }, filename?: string) {
    const hw = await this.prisma.homework.findUnique({
      where: { id, isDeleted: false },
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

    if (!hw) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Homework not found");
    }

    if (hw.lesson.section.course.mentor_id !== currentUser.id) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("Only mentor can update");
    }
    let fileName = hw.file
    if (filename) {
      const filePath = join(process.cwd(), 'src', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fileName = filename
    }

    await this.prisma.homework.update({
      where: { id },
      data: {
        task: payload.task,
        file: fileName
      }
    });
    return {
      success: true,
      message: "Homework updated successfully",
    }

  }
  async remove(id: number, currentUser: { id: number }) {
    const hw = await this.prisma.homework.findUnique({
      where: { id, isDeleted: false },
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

    if (!hw) {
      throw new NotFoundException("Homework not found");
    }

    if (hw.lesson.section.course.mentor_id !== currentUser.id) {
      throw new ForbiddenException("You cannot delete this homework");
    }

    await this.prisma.homework.update({
      where: { id },
      data: {
        isDeleted: true
      }
    });
    return {
      success: true,
      message: "Homework deleted successfully",
    }
  }
}
