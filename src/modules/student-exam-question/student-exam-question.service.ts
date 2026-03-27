import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentExamQuestionDto } from './dto/create-student-exam-question.dto';
import { UpdateStudentExamQuestionDto } from './dto/update-student-exam-question.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { ExamAnswer, UserRole } from '@prisma/client';

@Injectable()
export class StudentExamQuestionService {
  constructor(private readonly prisma: PrismaService) { }
  
  async calculateAndSaveResult(section_id: number, user_id: number) {
    const exams = await this.prisma.exam.findMany({ where: { section_id } });
    const totalExams = exams.length;

    const answers = await this.prisma.studentExamQuestion.findMany({
      where: { section_id, user_id }
    });

    const corrects = answers.filter(a => a.isCorrect).length;
    const wrongs = totalExams - corrects;
    const passed = totalExams === 0 ? false : (corrects / totalExams) * 100 >= 60;

    return this.prisma.examResult.upsert({
      where: { user_id_section_id: { user_id, section_id } },
      update: { corrects, wrongs, passed },
      create: { user_id, section_id, corrects, wrongs, passed }
    });
  }
  async create(section_id: number, payload: CreateStudentExamQuestionDto, currentUser: { id: number }) {

    const existing = await this.prisma.studentExamQuestion.findUnique({
      where: { user_id_exam_id: { user_id: currentUser.id, exam_id: payload.exam_id } }
    });

    if (existing) {
      throw new BadRequestException("You have already submitted this exam");
    }

    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: {
        lessons: true,
        course: {
          include: {
            purchasedCourses: true
          }
        }
      }
    });

    if (!section) throw new NotFoundException("Section not found");

    const hasAccess = section.course.purchasedCourses.some(p => p.user_id === currentUser.id);

    if (!hasAccess) {
      throw new ForbiddenException("You cannot take this exam");
    }

    const lessonIds = section.lessons.map(l => l.id);

    const completed = await this.prisma.lessonView.findMany({
      where: {
        user_id: currentUser.id,
        lesson_id: { in: lessonIds },
        view: true
      }
    });

    if (completed.length !== lessonIds.length) {
      throw new ForbiddenException("Finish all lessons first");
    }

    const exam = await this.prisma.exam.findFirst({
      where: { id: payload.exam_id, section_id }
    });

    if (!exam) {
      throw new NotFoundException("Exam not found");
    }

    if (!payload || payload.answer === undefined || payload.answer === null) {
      throw new BadRequestException("Answer is required");
    }

    const isCorrect = exam.answer === payload.answer;



    const created = await this.prisma.studentExamQuestion.create({
      data: {
        exam_id: exam.id,
        user_id: currentUser.id,
        answer: payload.answer,
        isCorrect,
        section_id
      }
    });

    const totalExams = await this.prisma.exam.count({ where: { section_id } });
    const answeredCount = await this.prisma.studentExamQuestion.count({
      where: { section_id, user_id: currentUser.id }
    });

    if (answeredCount === totalExams) {
      await this.calculateAndSaveResult(section_id, currentUser.id);
    }

    return {
      success: true,
      message: "Exam submitted"
    };
  }
  async findAll(section_id: number, user_id: number, currentUser: { id: number, role: UserRole }) {

    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: {
        course: {
          include: {
            assignedCourses: true,
            purchasedCourses: true
          }
        }
      }
    });

    if (!section) throw new NotFoundException();

    const courses = section.course;

    if (currentUser.role === UserRole.ADMIN) {
      return this.prisma.studentExamQuestion.findMany({
        where: { section_id, user_id },
        select: {
          id: true,
          answer: true,
          isCorrect: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          exam: {
            select: {
              id: true,
              question: true
            }
          }
        }
      });
    }

    if (currentUser.role === UserRole.MENTOR && courses.mentor_id === currentUser.id) {
      return this.prisma.studentExamQuestion.findMany({
        where: { section_id, user_id },
        select: {
          id: true,
          answer: true,
          isCorrect: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          exam: {
            select: {
              id: true,
              question: true
            }
          }
        }
      });
    }

    if (
      currentUser.role === UserRole.ASSISTANT &&
      courses.assignedCourses.some(a => a.user_id === currentUser.id && !a.isDeleted)
    ) {
      return this.prisma.studentExamQuestion.findMany({
        where: { section_id, user_id },
        select: {
          id: true,
          answer: true,
          isCorrect: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
          exam: {
            select: {
              id: true,
              question: true
            }
          }
        }
      });
    }
    throw new ForbiddenException("You don't have access to this section");
  }
  async findMyExam(section_id: number, currentUser) {

    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: {
        course: {
          include: {
            purchasedCourses: true
          }
        }
      }
    });

    if (!section) throw new NotFoundException("Section not found");

    const hasAccess = section.course.purchasedCourses.some(p => p.user_id === currentUser.id);

    if (!hasAccess) {
      throw new ForbiddenException("You cannot take this exam");
    }

    return await this.prisma.studentExamQuestion.findMany({
      where: {
        section_id,
        user_id: currentUser.id
      },
      select: {
        id: true,
        answer: true,
        exam: {
          select: {
            id: true,
            question: true
          }
        }
      }
    });

  }

}
