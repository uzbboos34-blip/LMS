import { Injectable } from '@nestjs/common';
import { CreateLessonViewDto } from './dto/create-lesson-view.dto';
import { UpdateLessonViewDto } from './dto/update-lesson-view.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonViewService {
  constructor(private prisma: PrismaService) {}
  async create(payload: CreateLessonViewDto, currentUser: { id: number }) {
    const lessonView = await this.prisma.lessonView.upsert({
      where: {
        lesson_id_user_id: {
          lesson_id: payload.lesson_id,
          user_id: currentUser.id,
        },
      },
      update: {
        view: payload.view,
      },
      create: {
        lesson_id: payload.lesson_id,
        user_id: currentUser.id,
        view: payload.view,
      },
    });
    return {
      success: true,
      message: 'Lesson view updated successfully',
      data: lessonView,
    };
  }

async findAll(currentUser: { id: number; role: UserRole }, query?: { lesson_id?: string }) {
    const where: any = {};

    if (query?.lesson_id) {
      where.lesson_id = +query.lesson_id;
    }

    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.lessonView.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          lesson: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    }

    where.user_id = currentUser.id;

    return await this.prisma.lessonView.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            name: true,
            section: {
              select: {
                id: true,
                course: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
}

  async findOne(lesson_id: number, currentUser: { id: number; role: UserRole }) {

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.lessonView.findMany({
        where: {
          lesson_id
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });
    }

    return await this.prisma.lessonView.findUnique({
      where: {
        lesson_id_user_id: {
          lesson_id,
          user_id: currentUser.id
        }
      }
    });
  }
}
