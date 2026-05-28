import { prisma } from 'config/client';
import {
  Enrollment,
  UpdateEnrollment,
} from 'src/validation/enrollment.schema';

import 'dotenv/config';

const handleGetAllEnrollments = async () => {
  return await prisma.enrollment.findMany({
    include: {
      student: true,
      course: true,
    },
  });
};

const handleGetEnrollmentById = async (id: number) => {
  return await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: true,
      course: true,
    },
  });
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
    const existingCourse = await prisma.course.findUnique({
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
    data: enrollment,
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
    data: enrollment,
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
