import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionAnswerDto } from './dto/create-question-answer.dto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class QuestionAnswerService {
  constructor(private prisma: PrismaService) { }
  async create(question_id: number, payload: CreateQuestionAnswerDto, currentUser: { id: number, role: UserRole }, filename?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: question_id },
      include: {
        course: { include: { assignedCourses: true } }
      }
    });

    if (!question) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException();
    }

    const courses = question.course;

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = courses.mentor_id === currentUser.id;
    const isAssistant = courses.assignedCourses.some(
      a => a.user_id === currentUser.id && !a.isDeleted
    );

    if (!isAdmin && !isMentor && !isAssistant) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You cannot answer this question");
    }

    return await this.prisma.questionAnswer.create({
      data: {
        question_id,
        user_id: currentUser.id,
        text: payload.text,
        file: filename ?? null
      }
    });
  }

  async findByCourse( course_id: number, currentUser: { id: number, role: UserRole }) {
    const course = await this.prisma.course.findUnique({
      where: { id: course_id }
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = course.mentor_id === currentUser.id;
    const isAssistant = await this.prisma.assignedCourse.findFirst({
      where: { course_id, user_id: currentUser.id, isDeleted: false }
    });

    if (!isAdmin && !isMentor && !isAssistant) {
      throw new ForbiddenException("You cannot view answers for this course");
    }

    return await this.prisma.question.findMany({
      where: { course_id },
      include: {
        answers: {
          include: {
            user: {
              select: { id: true, fullName: true, role: true }
            }
          }
        },
        user: {
          select: { id: true, fullName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number, currentUser: { id: number, role: UserRole }) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
      include: {
        question: {
          include: {
            course: true,
            user: { select: { id: true, fullName: true } }
          }
        },
        user: { select: { id: true, fullName: true, role: true } }
      }
    });

    if (!answer) {
      throw new NotFoundException("Answer not found");
    }

    const course = answer.question.course;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = course.mentor_id === currentUser.id;
    const isAssistant = await this.prisma.assignedCourse.findFirst({
      where: { course_id: course.id, user_id: currentUser.id, isDeleted: false }
    });

    if (!isAdmin && !isMentor && !isAssistant) {
      throw new ForbiddenException("You cannot view this answer");
    }

    return await this.prisma.questionAnswer.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        file: true,
        createdAt: true,
        user: {
          select: { id: true, fullName: true, role: true }
        }
      }
    });
  }

  async update(id: number, payload: UpdateQuestionAnswerDto, currentUser: { id: number, role: UserRole }, filename?: string) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
      include: {
        question: {
          include: {
            course: { include: { assignedCourses: true } }
          }
        }
      }
    });

    if (!answer) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new NotFoundException("Answer not found");
    }

    const courses = answer.question.course;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = courses.mentor_id === currentUser.id;
    const isAssistant = courses.assignedCourses.some(
      a => a.user_id === currentUser.id && !a.isDeleted
    );
    const isOwner = answer.user_id === currentUser.id;

    if (!isAdmin && !isMentor && !isAssistant && !isOwner) {
      if (filename) {
        const filePath = join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      throw new ForbiddenException("You cannot update this answer");
    }

    let fileName = answer.file;
    if (filename) {
      const filePath = join(process.cwd(), 'src', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        if (answer.file) {
          const oldFilePath = join(process.cwd(), 'src', 'uploads', answer.file);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        fileName = filename;
      }
    }

    return await this.prisma.questionAnswer.update({
      where: { id },
      data: {
        text: payload.text ?? answer.text,
        file: fileName 
      }
    });
  }

  async remove(id: number, currentUser: { id: number, role: UserRole }) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
      include: {
        question: {
          include: {
            course: { include: { assignedCourses: true } }
          }
        }
      }
    });

    if (!answer) {
      throw new NotFoundException("Answer not found");
    }

    const course = answer.question.course;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isMentor = course.mentor_id === currentUser.id;
    const isAssistant = course.assignedCourses.some(
      a => a.user_id === currentUser.id && !a.isDeleted
    );
    if (!isAdmin && !isMentor && !isAssistant) {
      throw new ForbiddenException("You cannot delete this answer");
    }

    if (answer.file) {
      const filePath = join(process.cwd(), 'src', 'uploads', answer.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.prisma.questionAnswer.delete({
      where: { id }
    });

    return {
      success: true,
      message: "Answer deleted successfully"
    };
  }
}
