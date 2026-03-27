import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';
import { HomeworkSubStatus, UserRole } from '@prisma/client';

@Injectable()
export class HomeworkSubmissionService {
  constructor(private readonly prisma: PrismaService) { }
  async create(homework_id, payload: CreateHomeworkSubmissionDto, currentUser: { id: number }, filename?: string) {
    const hw = await this.prisma.homework.findUnique({
      where: { id: homework_id, isDeleted: false },
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

    const hasAccess = await this.prisma.course.findFirst({
      where: {
        id: hw.lesson.section.course.id,
        purchasedCourses: {
          some: {
            user_id: currentUser.id
          }
        }
      }
    });

    if (!hasAccess) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You cannot submit");
    }

    const existing = await this.prisma.homeworkSubmission.findFirst({
      where: {
        homework_id,
        user_id: currentUser.id
      }
    });

    if (existing) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new BadRequestException("Already submitted");
    }

    return await this.prisma.homeworkSubmission.create({
      data: {
        ...payload,
        homework_id,
        user_id: currentUser.id,
        file: filename ?? null
      }
    });
  }

  async findAll(homework_id: number, currentUser: { id: number, role: UserRole }) {

    const hw = await this.prisma.homework.findUnique({
      where: { id: homework_id },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: {
                  include: {
                    assignedCourses: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!hw) throw new NotFoundException();

    const courseStudent = hw.lesson.section.course;

    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MENTOR || currentUser.role === UserRole.ASSISTANT) {
      return await this.prisma.homeworkSubmission.findMany({
        where: { homework_id },
        select: {
          id: true,
          text: true,
          reason: true,
          file: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });
    }

    return await this.prisma.homeworkSubmission.findMany({
      where: {
        homework_id,
        user_id: currentUser.id
      },
      select: {
        id: true,
        text: true,
        reason: true,
        file: true,
        createdAt: true
      }
    });
  }

  async findOne(id: number, currentUser) {

    const sub = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: {
        homework: {
          include: {
            lesson: {
              include: {
                section: {
                  include: {
                    course: {
                      include: {
                        assignedCourses: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!sub) throw new NotFoundException();

    const courseStudent = sub.homework.lesson.section.course;


    if (currentUser.role === UserRole.ADMIN) {
      return await this.prisma.homeworkSubmission.findUnique({
        where: { id },
        select: {
          id: true,
          text: true,
          reason: true,
          file: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      })
    };

    if (courseStudent.mentor_id === currentUser.id) {
      return await this.prisma.homeworkSubmission.findUnique({
        where: { id },
        select: {
          id: true,
          text: true,
          reason: true,
          file: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      })
    }

    if (courseStudent.assignedCourses.some(a => a.user_id === currentUser.id && !a.isDeleted)) {
      return await this.prisma.homeworkSubmission.findUnique({
        where: { id },
        select: {
          id: true,
          text: true,
          reason: true,
          file: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      })
    }
    if (sub.user_id === currentUser.id) {
      return await this.prisma.homeworkSubmission.findUnique({
        where: { id },
        select: {
          id: true,
          text: true,
          reason: true,
          file: true,
          createdAt: true
        }
      })
    }

    throw new ForbiddenException();
  }

  async update(id: number, payload: UpdateHomeworkSubmissionDto, currentUser: { id: number }, filename?: string) {
    const sub = await this.prisma.homeworkSubmission.findUnique({
      where: { id }
    })

    if (!sub) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Submission not found");
    }

    if (sub.user_id !== currentUser.id) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You can't update this submission");
    }

    if (sub.status != HomeworkSubStatus.PENDING) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new BadRequestException("Already checked");
    }

    let fileName = sub.file;
    if (filename) {
      if (sub.file) {
        const filePath = join(process.cwd(), 'src', 'uploads', sub.file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      fileName = filename
    }

    return await this.prisma.homeworkSubmission.update({
      where: { id },
      data: {
        ...payload,
        file: fileName
      }
    })
  }

  async check(id: number, payload, currentUser) {
    const sub = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: {
        homework: {
          include: {
            lesson: {
              include: {
                section: {
                  include: {
                    course: {
                      include: { assignedCourses: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!sub) throw new NotFoundException();

    const courses = sub.homework.lesson.section.course;
    const isMentor = courses.mentor_id === currentUser.id;
    const isAssistant = courses.assignedCourses.some(a => a.user_id == currentUser.id && !a.isDeleted);

    if (!isMentor && !isAssistant) {
      throw new ForbiddenException("You cannot check this submission");
    }

    await this.prisma.homeworkSubmission.update({
      where: { id },
      data: {
        status: payload.status,
        reason: payload.reason,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Checked successfully"
    };
  }

}
