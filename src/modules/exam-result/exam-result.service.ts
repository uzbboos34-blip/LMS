import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateExamResultDto } from "./dto/create-exam-result.dto";

@Injectable()
export class ExamResultService {
  constructor(private prisma: PrismaService) { }

  async create(payload: CreateExamResultDto, currentUser: { id: number, role: UserRole }) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: payload.section_id },
      include: { course: true }
    });

    if (!section) throw new NotFoundException("Section not found");

    if (
      currentUser.role !== UserRole.ADMIN &&
      section.course.mentor_id !== currentUser.id
    ) {
      throw new ForbiddenException("You don't have access to this course");
    }

    if (section.course.published === false) {
      throw new ForbiddenException("This course is not published yet");
    }

    const passed = (payload.corrects / (payload.corrects + payload.wrongs)) * 100 >= 60;

    return this.prisma.examResult.upsert({
      where: {
        user_id_section_id: { user_id: payload.user_id, section_id: payload.section_id }
      },
      update: {
        corrects: payload.corrects,
        wrongs: payload.wrongs,
        passed: payload.passed
      },
      create: {
        user_id: payload.user_id,
        section_id: payload.section_id,
        corrects: payload.corrects,
        wrongs: payload.wrongs,
        passed
      }
    });
  }
  async findAll(section_id: number, currentUser) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: section_id },
      include: { course: { include: { assignedCourses: true, purchasedCourses: true } } }
    });

    if (!section) throw new NotFoundException("Section not found");

    if (section.course.purchasedCourses.some(p => p.user_id === currentUser.id)) {
      return this.prisma.examResult.findMany({
        where: { section_id, user_id: currentUser.id },
        select: {
          id: true,
          corrects: true,
          wrongs: true,
          passed: true
        }
      })
    }

    const courses = section.course;
    if (
      currentUser.role !== UserRole.ADMIN &&
      courses.mentor_id !== currentUser.id &&
      !courses.assignedCourses.some(a => a.user_id === currentUser.id && !a.isDeleted)
    ) {
      throw new ForbiddenException("You cannot view these results");
    } 

    return this.prisma.examResult.findMany({
      where: { section_id },
      select: {
        id: true,
        corrects: true,
        wrongs: true,
        passed: true,
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });
  }
}