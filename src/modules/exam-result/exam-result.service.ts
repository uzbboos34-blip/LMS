import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";

@Injectable()
export class ExamResultService {
  constructor(private prisma: PrismaService) { }

  async getMyResult(section_id: number, currentUser) {
    const totalExams = await this.prisma.exam.count({
      where: { section_id }
    });

    const answeredCount = await this.prisma.studentExamQuestion.count({
      where: {
        section_id,
        user_id: currentUser.id
      }
    });

    if (answeredCount !== totalExams) {
      throw new ForbiddenException("Savollarga to'liq javob berilmagan");
    }
    return this.prisma.examResult.findUnique({
      where: {
        user_id_section_id: {
          user_id: currentUser.id,
          section_id
        }
      },
      select: {
        corrects: true,
        wrongs: true,
        passed: true
      }
    });
  }

  async getAllResults(section_id: number, currentUser) {

    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: {
        course: {
          include: { assignedCourses: true }
        }
      }
    });

    if (!section) throw new NotFoundException();

    const course = section.course;

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = course.mentor_id === currentUser.id;
    const isAssistant = course.assignedCourses.some(
      a => a.user_id === currentUser.id && !a.isDeleted
    );

    if (!isAdmin && !isMentor && !isAssistant) {
      throw new ForbiddenException();
    }

    const totalExams = await this.prisma.exam.count({
      where: { section_id }
    });

    const results = await this.prisma.examResult.findMany({
      where: { section_id },
      include: {
        user: true
      }
    });

    const final: {
      user: {
        id: number;
        fullName: string;
      };
      corrects: number;
      wrongs: number;
      passed: boolean;
    }[] = [];

    for (const r of results) {
      const answeredCount = await this.prisma.studentExamQuestion.count({
        where: {
          section_id,
          user_id: r.user_id
        }
      });

      if (answeredCount === totalExams) {
        final.push({
          user: { id: r.user.id, fullName: r.user.fullName },
          corrects: r.corrects,
          wrongs: r.wrongs,
          passed: r.passed
        });
      }
    }
    return final;
  }
}