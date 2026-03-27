import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionLessonDto } from './dto/create-section-lesson.dto';
import { UpdateSectionLessonDto } from './dto/update-section-lesson.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class SectionLessonService {
  constructor(private prisma: PrismaService) {}
  async create(payload: CreateSectionLessonDto) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: payload.course_id,
        published: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    await this.prisma.sectionLesson.create({
      data: payload
    })
    return {
      success: true,
      message: "Section lesson created successfully",
    }
  }

  async findSectionsByCourse(id: number, currentUser: { id: number, role: UserRole }) {
    const course = await this.prisma.course.findUnique({
      where:{id},
      select:{
        mentor_id: true,
        assignedCourses: {
          select: {
            user_id: true
          }
        }
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.sectionLesson.findMany({
        where: {
          course_id: id
        },
        select: {
          id: true,
          name: true
        }
      })
    }

    if (course.mentor_id == currentUser.id) {
      return await this.prisma.sectionLesson.findMany({
        where: {
          course_id: id,
          isDeleted: false,
          course: {
            published: true
          }
        },
        select: {
          id: true,
          name: true
        }
      })
    }
    if (course.assignedCourses.some((assignedCourse) => assignedCourse.user_id == currentUser.id)) {
      return await this.prisma.sectionLesson.findMany({
        where: {
          course_id: id,
          isDeleted: false,
          course: {
            published: true
          }
        },
        select: {
          id: true,
          name: true
        }
      })
    }
    return await this.prisma.sectionLesson.findMany({
      where: {
        course_id: id,
        isDeleted: false,
        course: {
          published: true,
          purchasedCourses: {
            some: {
              user_id: currentUser.id
            }
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    })
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const sectionLesson = await this.prisma.sectionLesson.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!sectionLesson) {
      throw new NotFoundException("Section lesson not found")
    }
    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.sectionLesson.findUnique({
        where: {
          id
        }
      })
    }
    return await this.prisma.sectionLesson.findUnique({
      where: {
        id,
        course: {
          published: true
        }
      }
    })
  }

  async update(id: number, payload: UpdateSectionLessonDto) {
    const sectionLesson = await this.prisma.sectionLesson.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!sectionLesson) {
      throw new NotFoundException("Section lesson not found")
    }
    const course = await this.prisma.course.findUnique({
      where: {
        id: payload.course_id,
        published: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }

    await this.prisma.sectionLesson.update({
      where: {
        id
      },
      data: payload
    })
    return {
      success: true,
      message: "Section lesson updated successfully",
    }
  }

  async isDeleteFalse(id: number) {
    const sectionLesson = await this.prisma.sectionLesson.findUnique({
      where: {
        id
      }
    })
    if (!sectionLesson) {
      throw new NotFoundException("Section lesson not found")
    }
    
    await this.prisma.sectionLesson.update({
      where: {
        id
      },
      data: {
        isDeleted: false
      }
    })
    return {
      success: true,
      message: "Section lesson deleted successfully",
    }
  }
  async remove(id: number) {
    const sectionLesson = await this.prisma.sectionLesson.findUnique({
      where: {
        id
      }
    })
    if (!sectionLesson) {
      throw new NotFoundException("Section lesson not found")
    }
    await this.prisma.sectionLesson.update({
      where: {
        id
      },
      data: {
        isDeleted: true
      }
    })
    return {
      success: true,
      message: "Section lesson deleted successfully",
    }
  }
}
