import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchasedCourseDto } from './dto/create-purchased-course.dto';
import { UpdatePurchasedCourseDto } from './dto/update-purchased-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PurchasedCourseService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreatePurchasedCourseDto , currentUser: { id: number , role: UserRole}) {
      if (currentUser.role == UserRole.MENTOR) {
            const courseMentor = await this.prisma.course.findUnique({
              where: {
                id: payload.course_id,
                published: true,
              }
            })
            if (!courseMentor) {
              throw new NotFoundException("Course not found")
            }
      
            if (courseMentor.mentor_id == currentUser.id) {
              throw new BadRequestException("You can't assign your own course")
            }
      
            const existing = await this.prisma.purchasedCourse.findFirst({
                where: {
                  course_id: payload.course_id,
                  user_id: currentUser.id
                }
            })
            if (existing) {
              throw new BadRequestException("You already assigned this course")
            }
      
            await this.prisma.purchasedCourse.create({
              data: {
                ...payload,
                user_id: currentUser.id
              }
            })
      
            return {
              success: true,
              message: "Assigned course created successfully"
            }
          }

      if (currentUser.role == "ASSISTANT") {
        const courseAssistant = await this.prisma.course.findUnique({
          where: {
            id: payload.course_id,
            published: true,
          }
        })
        if (!courseAssistant) {
          throw new NotFoundException("Course not found")
        }

        const temp = await this.prisma.assignedCourse.findFirst({
          where: {
            course_id: payload.course_id,
            user_id: currentUser.id,
            isDeleted: false
          }
        })
        if (temp) {
          throw new BadRequestException("You already have access to this course as an assistant")
        }

        const existingAssistant = await this.prisma.purchasedCourse.findFirst({
          where: {
            course_id: payload.course_id,
            user_id: currentUser.id
          }
        })

        if (existingAssistant) {
          throw new BadRequestException("You already assigned this course")
        }

        await this.prisma.purchasedCourse.create({
          data: {
            ...payload,
            user_id: currentUser.id
          }
        })

        return {
          success: true,
          message: "Assigned course created successfully"
        }
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

      const existingStudent = await this.prisma.purchasedCourse.findFirst({
        where: {
          course_id: payload.course_id,
          user_id: currentUser.id
        }
      })

      if (existingStudent) {
        throw new BadRequestException("You already assigned this course")
      }

      await this.prisma.purchasedCourse.create({
        data: {
          ...payload,
          user_id: currentUser.id
        }
      })
      return {
        success: true,
        message: "Assigned course created successfully"
      }
  }

  async findAll(currentUser: {id: number , role: UserRole}) {

    if (currentUser.role != "ADMIN") {
      return await this.prisma.purchasedCourse.findMany({
      where: {
        user_id: currentUser.id
      },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              price: true
            },
          }
        }
      })
    }

    return await this.prisma.purchasedCourse.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            price: true
          },
        }
      }
    })
  }

  async findOne(id: number, currentUser: {id: number , role: UserRole}) {
    if (currentUser.role == 'ADMIN') {
      return await this.prisma.purchasedCourse.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              price: true
            },
          }
        }
      })
    }

    return await this.prisma.purchasedCourse.findUnique({
      where: {
        id,
        user_id: currentUser.id
      },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            name: true,
            price: true
          },
        }
      }
    })
  }
}
