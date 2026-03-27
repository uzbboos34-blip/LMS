import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) { }
  async create(payload: CreateExamDto, currentUser: { id: number, role: UserRole }) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: payload.section_id },
      include: {
        course: true
      }
    })

    if (!section) {
      throw new NotFoundException('Section not found')
    }

    if (section.course.mentor_id != currentUser.id) {
      throw new ForbiddenException('Only mentor can create exam')
    }

    await this.prisma.exam.create({
      data: payload
    })

    return {
      success: true,
      message: "Exam created successfully",
    }
  }

  async findAll(section_id: number, currentUser: { id: number, role: UserRole }) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: {
        lessons: true,
        course: {
          include: {
            assignedCourses: true,
            purchasedCourses: true
          }
        }
      }
    })

    if (!section) {
      throw new NotFoundException('Section not found')
    }

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.exam.findMany({
        where: {
          section_id
        },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (section.course.mentor_id == currentUser.id) {
      return await this.prisma.exam.findMany({
        where: {
          section_id
        },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (section.course.assignedCourses.some(course => course.user_id == currentUser.id && !course.isDeleted)) {
      return await this.prisma.exam.findMany({
        where: {
          section_id
        },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (section.course.purchasedCourses.some(course => course.user_id == currentUser.id)) {
      const lessonIds = section.lessons.map(l => l.id);

      const completedLessons = await this.prisma.lessonView.findMany({
        where: { user_id: currentUser.id, lesson_id: { in: lessonIds }, view: true },
        select: { lesson_id: true },
      });

      if (completedLessons.length !== lessonIds.length) {
        throw new ForbiddenException("You must complete all lessons in this section before taking the exam");
      }

      return this.prisma.exam.findMany({
        where: { section_id },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
    }
    throw new ForbiddenException("You cannot access this section's exams");
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            lessons: true,
            course: {
              include: {
                assignedCourses: true,
                purchasedCourses: true
              }
            }
          }
        }
      }
    })

    if (!exam) {
      throw new NotFoundException('Exam not found')
    }

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.exam.findUnique({
        where: { id },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (exam.section.course.mentor_id == currentUser.id) {
      return await this.prisma.exam.findUnique({
        where: { id },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (exam.section.course.assignedCourses.some(course => course.user_id == currentUser.id && !course.isDeleted)) {
      return await this.prisma.exam.findUnique({
        where: { id },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          answer: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    if (exam.section.course.purchasedCourses.some(course => course.user_id == currentUser.id)) {
      return await this.prisma.exam.findUnique({
        where: { id },
        select: {
          id: true,
          question: true,
          variantA: true,
          variantB: true,
          variantC: true,
          variantD: true,
          section: {
            select: {
              name: true,
              course: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    throw new ForbiddenException("You cannot access this exam");
  }

  async update(id: number, payload: UpdateExamDto, currentUser: { id: number, role: UserRole }) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true
            }
          }
        }
    })

    if (!exam) {
      throw new NotFoundException('Exam not found')
    }

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.exam.update({
        where: { id },
        data: payload
      })
    }

    if (exam.section.course.mentor_id == currentUser.id) {
      return await this.prisma.exam.update({
        where: { id },
        data: payload
      })
    }

    throw new ForbiddenException("You cannot access this exam");
  }

  async remove(id: number, currentUser: { id: number, role: UserRole }) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    })

    if (!exam) {
      throw new NotFoundException('Exam not found')
    }

    if (currentUser.role == UserRole.ADMIN) {
      return await this.prisma.exam.update({
        where: { id },
        data: {
          isDeleted: true
        }
      })
    }

    if (exam.section.course.mentor_id == currentUser.id) {
      return await this.prisma.exam.update({
        where: { id },
        data: {
          isDeleted: true
        }
      })
    }

    throw new ForbiddenException("You cannot access this exam");
  }
}
