import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) { }
  async create(payload: CreateQuestionDto, currentUser: { id: number }, filename?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: payload.course_id },
      include: { purchasedCourses: true }
    });

    if (!course) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Course not found");
    }

    const hasAccess = course.purchasedCourses.some(
      p => p.user_id === currentUser.id
    );

    if (!hasAccess) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You cannot ask question in this course");
    }

    return this.prisma.question.create({
      data: {
        user_id: currentUser.id,
        course_id: payload.course_id,
        text: payload.text,
        file: filename ?? null
      }
    });
  }

  async findAll(currentUser: { id: number, role: UserRole }, query?: { course_id?: string, read?: string }) {
    const where: any = {};

    if (query?.course_id) {
      where.course_id = +query.course_id;
    }

    if (query?.read !== undefined) {
      where.read = query.read === 'true';
    }

    if (currentUser.role === UserRole.ADMIN) {
      return this.prisma.question.findMany({
        where,
        select: {
          id: true,
          text: true,
          file: true,
          read: true,
          readAt: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              fullName: true
            }
          },
          course: {
            select: {
              name: true
            }
          }
        }
      });
    }

    if (currentUser.role === UserRole.MENTOR) {
      where.course = { mentor_id: currentUser.id };
      return this.prisma.question.findMany({
        where,
        select: {
          id: true,
          text: true,
          file: true,
          read: true,
          readAt: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              fullName: true
            }
          },
          course: {
            select: {
              name: true
            }
          }
        }
      });
    }

    if (currentUser.role === UserRole.ASSISTANT) {
      where.course = {
        assignedCourses: {
          some: { user_id: currentUser.id, isDeleted: false }
        }
      };
      return this.prisma.question.findMany({
        where,
        select: {
          id: true,
          text: true,
          file: true,
          read: true,
          readAt: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              fullName: true
            }
          },
          course: {
            select: {
              name: true
            }
          }
        }
      });
    }

    // STUDENT: only own questions, but if course_id provided, check if purchased
    if (query?.course_id) {
      const purchased = await this.prisma.purchasedCourse.findFirst({
        where: { course_id: +query.course_id, user_id: currentUser.id }
      });
      if (!purchased) {
        throw new ForbiddenException("You have not purchased this course");
      }
    } else {
      where.user_id = currentUser.id;
    }

    return this.prisma.question.findMany({
      where,
      select: {
        id: true,
        text: true,
        file: true,
        read: true,
        readAt: true,
        updatedAt: true,
        createdAt: true,
        course: {
          select: {
            name: true
          }
        }
      }
    });
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        course: { include: { assignedCourses: true } },
        answers: true
      }
    });

    if (!question) throw new NotFoundException();

    const courses = question.course;

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = courses.mentor_id === currentUser.id;
    const isAssistant = courses.assignedCourses.some(
      a => a.user_id === currentUser.id && !a.isDeleted
    );
    const isOwner = question.user_id === currentUser.id;

    if (!isAdmin && !isMentor && !isAssistant && !isOwner) {
      throw new ForbiddenException("You cannot view this question");
    }

    if ((isMentor || isAssistant) && !question.read) {
      await this.prisma.question.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date()
        }
      });
    }

    return await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        file: true,
        read: true,
        readAt: true,
        updatedAt: true,
        createdAt: true,
        answers: {
          select: {
            id: true,
            text: true,
            file: true,
            updatedAt: true,
            createdAt: true,
          }
        },
        user: {
          select: {
            fullName: true
          }
        },
        course: {
          select: {
            name: true
          }
        }
      }
    });
  }

  async remove(id: number, currentUser: { id: number, role: UserRole }) {
    const question = await this.prisma.question.findUnique({
      where: { id }
    });

    if (!question) throw new NotFoundException();

    if (
      currentUser.role !== UserRole.ADMIN &&
      question.user_id !== currentUser.id
    ) {
      throw new ForbiddenException("You cannot delete this question");
    }

    return this.prisma.question.delete({
      where: { id }
    });
  }
}
