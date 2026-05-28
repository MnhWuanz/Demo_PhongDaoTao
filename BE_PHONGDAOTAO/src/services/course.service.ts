import { prisma } from 'config/client';
import { Course, UpdateCourse } from 'src/validation/course.schema';

import 'dotenv/config';

const handleGetAllCourses = async () => {
  return await prisma.course.findMany({
    include: {
      teacher: true,
      room: true,
      startShift: true,
      endShift: true,
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  });
};

const handleGetCourseById = async (id: number) => {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      teacher: true,
      room: true,
      startShift: true,
      endShift: true,
      enrollments: true,
    },
  });
};

const handleCreateCourse = async (course: Course) => {
  const existingTeacher = await prisma.teacher.findUnique({
    where: { id: course.teacherId },
  });

  if (!existingTeacher) {
    return { data: null, error: 'TEACHER_NOT_FOUND' };
  }

  if (course.roomId) {
    const existingRoom = await prisma.room.findUnique({
      where: { id: course.roomId },
    });
    if (!existingRoom) {
      return { data: null, error: 'ROOM_NOT_FOUND' };
    }
  }

  if (course.startShiftId) {
    const existingShift = await prisma.shift.findUnique({
      where: { id: course.startShiftId },
    });
    if (!existingShift) {
      return { data: null, error: 'SHIFT_NOT_FOUND' };
    }
  }

  if (course.endShiftId) {
    const existingShift = await prisma.shift.findUnique({
      where: { id: course.endShiftId },
    });
    if (!existingShift) {
      return { data: null, error: 'SHIFT_NOT_FOUND' };
    }
  }

  const newCourse = await prisma.course.create({
    data: course,
  });

  return { data: newCourse };
};

const handleUpdateCourse = async (id: number, course: UpdateCourse) => {
  const existingCourse = await handleGetCourseById(id);

  if (!existingCourse) {
    return { data: null, error: 'COURSE_NOT_FOUND' };
  }

  if (course.teacherId) {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: course.teacherId },
    });

    if (!existingTeacher) {
      return { data: null, error: 'TEACHER_NOT_FOUND' };
    }
  }

  if (course.roomId) {
    const existingRoom = await prisma.room.findUnique({
      where: { id: course.roomId },
    });
    if (!existingRoom) {
      return { data: null, error: 'ROOM_NOT_FOUND' };
    }
  }

  if (course.startShiftId) {
    const existingShift = await prisma.shift.findUnique({
      where: { id: course.startShiftId },
    });
    if (!existingShift) {
      return { data: null, error: 'SHIFT_NOT_FOUND' };
    }
  }

  if (course.endShiftId) {
    const existingShift = await prisma.shift.findUnique({
      where: { id: course.endShiftId },
    });
    if (!existingShift) {
      return { data: null, error: 'SHIFT_NOT_FOUND' };
    }
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: course,
  });

  return { data: updatedCourse };
};

const handleDeleteCourse = async (id: number) => {
  const existingCourse = await handleGetCourseById(id);

  if (!existingCourse) {
    return null;
  }

  return await prisma.course.delete({
    where: { id },
  });
};

const handleBulkEnroll = async (courseId: number, studentIds: number[]) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return { data: null, error: 'COURSE_NOT_FOUND' };
  }

  const createdEnrollments = [];
  for (const studentId of studentIds) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      continue;
    }

    const existing = await prisma.enrollment.findFirst({
      where: { studentId, courseId },
    });

    if (!existing) {
      const enrollment = await prisma.enrollment.create({
        data: { studentId, courseId },
      });
      createdEnrollments.push(enrollment);
    }
  }

  return { data: createdEnrollments };
};

export {
  handleCreateCourse,
  handleDeleteCourse,
  handleGetAllCourses,
  handleGetCourseById,
  handleUpdateCourse,
  handleBulkEnroll,
};
