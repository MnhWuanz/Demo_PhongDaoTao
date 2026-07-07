import { prisma } from 'config/client';
import {
  Enrollment,
  UpdateEnrollment,
} from 'src/validation/enrollment.schema';

import 'dotenv/config';

const handleGetAllEnrollments = async () => {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: true,
      courseClass: {
        include: {
          subject: true,
        },
      },
    },
  });
  return enrollments.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    courseId: e.courseClassId,
    student: e.student,
    course: {
      id: e.courseClass.id,
      courseCode: e.courseClass.courseCode,
      name: e.courseClass.subject.name,
      teacherId: e.courseClass.teacherId,
    },
  }));
};

const handleGetEnrollmentById = async (id: number) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: true,
      courseClass: {
        include: {
          subject: true,
        },
      },
    },
  });
  if (!enrollment) return null;
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    courseId: enrollment.courseClassId,
    student: enrollment.student,
    course: {
      id: enrollment.courseClass.id,
      courseCode: enrollment.courseClass.courseCode,
      name: enrollment.courseClass.subject.name,
      teacherId: enrollment.courseClass.teacherId,
    },
  };
};

const checkEnrollmentRelations = async (enrollment: UpdateEnrollment) => {
  if (enrollment.studentId) {
    const existingStudent = await prisma.student.findUnique({
      where: { id: enrollment.studentId },
    });

    if (!existingStudent) {
      return 'STUDENT_NOT_FOUND';
    }
  }

  if (enrollment.courseId) {
    const existingCourse = await prisma.courseClass.findUnique({
      where: { id: enrollment.courseId },
    });

    if (!existingCourse) {
      return 'COURSE_NOT_FOUND';
    }
  }

  return null;
};

const handleCreateEnrollment = async (enrollment: Enrollment) => {
  const relationError = await checkEnrollmentRelations(enrollment);

  if (relationError) {
    return { data: null, error: relationError };
  }

  const newEnrollment = await prisma.enrollment.create({
    data: {
      studentId: enrollment.studentId,
      courseClassId: enrollment.courseId,
    },
  });

  return { data: newEnrollment };
};

const handleUpdateEnrollment = async (
  id: number,
  enrollment: UpdateEnrollment,
) => {
  const existingEnrollment = await handleGetEnrollmentById(id);

  if (!existingEnrollment) {
    return { data: null, error: 'ENROLLMENT_NOT_FOUND' };
  }

  const relationError = await checkEnrollmentRelations(enrollment);

  if (relationError) {
    return { data: null, error: relationError };
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      studentId: enrollment.studentId ? enrollment.studentId : undefined,
      courseClassId: enrollment.courseId ? enrollment.courseId : undefined,
    },
  });

  return { data: updatedEnrollment };
};

const handleDeleteEnrollment = async (id: number) => {
  const existingEnrollment = await handleGetEnrollmentById(id);

  if (!existingEnrollment) {
    return null;
  }

  return await prisma.enrollment.delete({
    where: { id },
  });
};

export {
  handleCreateEnrollment,
  handleDeleteEnrollment,
  handleGetAllEnrollments,
  handleGetEnrollmentById,
  handleUpdateEnrollment,
};
