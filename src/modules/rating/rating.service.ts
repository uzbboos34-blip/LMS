import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateRatingDto, currentUser: { id: number}) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: payload.course_id,
        published: true
      }
    })
    if (!course) {
      throw new NotFoundException("Course not found")
    }
    await this.prisma.rating.create({
      data: {
        ...payload,
        user_id: currentUser.id
      }
    })
    return {
      success: true,
      message: "Rating created successfully",
    }
  }

  async findAll(currentUser: { id: number, role: UserRole }) {
    console.log(currentUser.role);
    
    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.rating.findMany({
        select: {
          id: true,
          rate: true,
          comment: true,
          isDeleted: true,
          course: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              image: true
            }
          }
        }
      })
    }
    return await this.prisma.rating.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        rate: true,
        comment: true,
        course: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            image: true
          }
        }
      }
    })
  }

  async update(id: number, payload: UpdateRatingDto, currentUser: { id: number; role: UserRole }) {

    const rating = await this.prisma.rating.findUnique({
      where: { id }
    })

    if (!rating) {
      throw new NotFoundException("Rating not found")
    }

    if (rating.isDeleted) {
      throw new BadRequestException("Cannot update deleted rating")
    }

    if (rating.user_id != currentUser.id && currentUser.role != UserRole.ADMIN) {
      throw new ForbiddenException("You cannot update this rating")
    }

    const updated = await this.prisma.rating.update({
      where: { id },
      data: {
        rate: payload.rate,
        comment: payload.comment
      }
    })

    return {
      success: true,
      data: updated
    }
}

  async remove(id: number, currentUser: { id: number; role: UserRole }) {

    const rating = await this.prisma.rating.findUnique({
      where: { id }
    })

    if (!rating) {
      throw new NotFoundException("Rating not found")
    }

    if (rating.isDeleted) {
      throw new BadRequestException("Cannot delete deleted rating")
    }

    if (rating.user_id != currentUser.id && currentUser.role != UserRole.ADMIN) {
      throw new ForbiddenException("You cannot delete this rating")
    }

    await this.prisma.rating.update({
      where: { id },
      data: {
        isDeleted: true
      }
    })

    return {
      success: true,
      message: "Rating deleted"
    }
  }
}
