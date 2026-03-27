import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignedCourseDto } from './dto/create-assigned-course.dto';
import { UpdateAssignedCourseDto } from './dto/update-assigned-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';
import { QueryDto } from './dto/quare.dto';

@Injectable()
export class AssignedCourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateAssignedCourseDto, currentUser: { id: number, role: UserRole }) {

    const user = await this.prisma.user.findUnique({
      where:{
        id:payload.user_id,
        status: "ACTIVE",
        role: "ASSISTANT"
      }
    })

    if (!user) {
      throw new NotFoundException("User not found")
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

    const existingAssistant = await this.prisma.assignedCourse.findFirst({
      where:{
        course_id:payload.course_id,
        course:{
          published:true  
        }
      }
    })

    if (existingAssistant) {
      throw new ConflictException("This course already has an assistant")
    }

    await this.prisma.assignedCourse.create({
      data: {
        course_id: payload.course_id,
        user_id: payload.user_id
      }
    })
    return {
      success: true,
      message: "Course assigned successfully",
    }    
  }

  async findAll(query:QueryDto) {
    const where:any = {}
    if (query.isDeleted) {
      where.isDeleted = query.isDeleted
    }
    return await this.prisma.assignedCourse.findMany({
      where,
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async findMe(currentUser: { id: number }) {
    return await this.prisma.assignedCourse.findMany({
      where: {
        user_id: currentUser.id,
        isDeleted: false
      },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async findOne(id: number) {
    return await this.prisma.assignedCourse.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async update(id: number, payload: UpdateAssignedCourseDto) {
    const assignedCourse = await this.prisma.assignedCourse.findUnique({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!assignedCourse) {
      throw new NotFoundException("Assigned course not found")
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.user_id,
        status: "ACTIVE",
        role: "ASSISTANT"
      }
    })

    if (!user) {
      throw new NotFoundException("User not found")
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

    await this.prisma.assignedCourse.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
    return {
      success: true,
      message: "Course updated successfully",
    } 
  }

  async remove(id: number) {
    const assignedCourse = await this.prisma.assignedCourse.findUnique({
      where:{
        id,
        isDeleted: false
      }
    })
    if (!assignedCourse) {
      throw new NotFoundException("Assigned course not found")
    }
    await this.prisma.assignedCourse.update({
      where: {
        id
      },
      data: {
        isDeleted: true
      }
    })
    return {
      success: true,
      message: "Course deleted successfully",
    }
  }
}
