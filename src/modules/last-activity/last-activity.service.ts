import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLastActivityDto } from './dto/create-last-activity.dto';
import { UpdateLastActivityDto } from './dto/update-last-activity.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class LastActivityService {
  constructor(private readonly prisma: PrismaService) { }
  async create(payload: CreateLastActivityDto, currentUser: { id: number }) {

    const course = await this.prisma.course.findUnique({
      where: {
        id: payload.course_id,
        published: true
      }
    })
    if (!course) throw new NotFoundException("Course not found")

    const section = await this.prisma.sectionLesson.findUnique({
      where: { 
        id: payload.section_id, 
        course_id: payload.course_id 
      }
    })
    if (!section) throw new NotFoundException("Section not found in this course")

    const lesson = await this.prisma.lesson.findUnique({
      where: { 
        id: payload.lesson_id, 
        section_id: payload.section_id 
      }
    })

    if (!lesson) throw new NotFoundException("Lesson not found in this course")
    
    await this.prisma.lastActivity.upsert({
      where: {
        user_id: currentUser.id
      },
      update: {
        course_id: payload.course_id,
        section_id: payload.section_id,
        lesson_id: payload.lesson_id,
        url: payload.url
      },
      create: {
        user_id: currentUser.id,
        course_id: payload.course_id,
        section_id: payload.section_id,
        lesson_id: payload.lesson_id,
        url: payload.url
      }
    })
    return {
      success: true,
      message: "Last activity created successfully",
    }
  }

  async findAll(currentUser: { id: number, role: UserRole }) {
    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.lastActivity.findMany({
        select: {
          id: true,
          url: true,
          user: {
            select: {
              id: true,
              fullName: true,
            }
          },
          course: {
            select: {
              name: true
            }
          },
          section: {
            select: {
              name: true
            }
          },
          lesson: {
            select: {
              name: true
            }
          }
        }
      })
    }

    return await this.prisma.lastActivity.findMany({
      where: {
        user_id: currentUser.id
      },
      select: {
        id: true,
        url: true,
        course: {
          select: {
            name: true
          }
        },
        section: {
          select: {
            name: true
          }
        },
        lesson: {
          select: {
            name: true
          }
        }
      }
    })
  }

  async update(id: number, payload: UpdateLastActivityDto, currentUser: { id: number; role: UserRole }) {

    const lastActivity = await this.prisma.lastActivity.findUnique({
      where: { id }
    })

    if (!lastActivity) {
      throw new NotFoundException("Last activity not found")
    }

    if (lastActivity.isDeleted) {
      throw new BadRequestException("Cannot update deleted last activity")
    }

    if (payload.course_id) {
      const course = await this.prisma.course.findUnique({
        where: {
          id: payload.course_id,
          published: true
        }
      })
      if (!course) throw new NotFoundException("Course not found")
    }

    if (payload.section_id) {
      const section = await this.prisma.sectionLesson.findUnique({
        where: { 
          id: payload.section_id, 
          course_id: payload.course_id || lastActivity.course_id
        }
      })
      if (!section) throw new NotFoundException("Section not found in this course")
    }

    if (payload.lesson_id) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { 
          id: payload.lesson_id, 
          section_id: payload.section_id || lastActivity.section_id
        }
      })
      if (!lesson) throw new NotFoundException("Lesson not found in this course")
    }
    

    if (currentUser.id != lastActivity.user_id && currentUser.role != UserRole.ADMIN) {
      throw new ForbiddenException("You cannot update this activity")
    }

    await this.prisma.lastActivity.update({
      where: { id },
      data: {
        ...payload
      }
    })

    return {
      success: true,
      message: "Last activity updated successfully"
    }

  }

  async remove(id: number, currentUser: { id: number; role: UserRole }) {
    const lastActivity = await this.prisma.lastActivity.findUnique({
      where: { 
        id,
        isDeleted: false
      }
    })
    if (!lastActivity) {
      throw new NotFoundException("Last activity not found")
    }

    if (lastActivity.user_id != currentUser.id && currentUser.role != UserRole.ADMIN) {
      throw new ForbiddenException("You cannot delete this activity")
    }
    await this.prisma.lastActivity.update({
      where: { 
        id
      },
      data: {
        isDeleted: true
      }
    })
    return {
      success: true,
      message: "Last activity deleted successfully",
    }
  }
}
