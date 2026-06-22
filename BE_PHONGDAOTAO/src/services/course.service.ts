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

const checkConflict = async (course: {
  id?: number;
  roomId?: number | null;
  teacherId: number;
  startShiftId?: number | null;
  endShiftId?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  dayOfWeek?: number | null;
}) => {
  if (!course.startShiftId || !course.endShiftId || !course.start_date || !course.end_date || !course.dayOfWeek) {
    return null;
  }

  const newStart = new Date(course.start_date);
  const newEnd = new Date(course.end_date);

  const existingCourses = await prisma.course.findMany({
    where: {
      id: course.id ? { not: course.id } : undefined,
      startShiftId: { not: null },
      endShiftId: { not: null },
      start_date: { not: null },
      end_date: { not: null },
      dayOfWeek: course.dayOfWeek,
    },
    include: {
      teacher: true,
      room: true,
      startShift: true,
      endShift: true,
    }
  });

  for (const existing of existingCourses) {
    const extStart = new Date(existing.start_date!);
    const extEnd = new Date(existing.end_date!);

    // Overlap dates: !(newEnd < extStart || newStart > extEnd)
    const dateOverlap = !(newEnd < extStart || newStart > extEnd);
    if (!dateOverlap) continue;

    // Overlap shifts: !(endA < startB || startA > endB)
    const startA = course.startShiftId;
    const endA = course.endShiftId;
    const startB = existing.startShiftId!;
    const endB = existing.endShiftId!;

    const shiftOverlap = !(endA < startB || startA > endB);
    if (!shiftOverlap) continue;

    // Teacher conflict
    if (existing.teacherId === course.teacherId) {
      const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
      return `Giảng viên ${existing.teacher.name} đã có lịch dạy lớp "${existing.name}" (${existing.courseCode}) vào Thứ ${course.dayOfWeek} (Tiết ${existing.startShiftId}-${existing.endShiftId}) từ ${formatDate(extStart)} đến ${formatDate(extEnd)}.`;
    }

    // Room conflict
    if (course.roomId && existing.roomId === course.roomId) {
      const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
      return `Phòng ${existing.room?.name || existing.roomId} đã được sử dụng cho lớp "${existing.name}" (${existing.courseCode}) của giảng viên ${existing.teacher.name} vào Thứ ${course.dayOfWeek} (Tiết ${existing.startShiftId}-${existing.endShiftId}) từ ${formatDate(extStart)} đến ${formatDate(extEnd)}.`;
    }
  }

  return null;
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

  // Check schedule conflicts
  const conflictMessage = await checkConflict(course);
  if (conflictMessage) {
    return { data: null, error: `CONFLICT:${conflictMessage}` };
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

  // Merge existing fields to perform full conflict checking
  const mergedCourse = {
    id,
    teacherId: course.teacherId !== undefined ? course.teacherId! : existingCourse.teacherId,
    roomId: course.roomId !== undefined ? course.roomId : existingCourse.roomId,
    startShiftId: course.startShiftId !== undefined ? course.startShiftId : existingCourse.startShiftId,
    endShiftId: course.endShiftId !== undefined ? course.endShiftId : existingCourse.endShiftId,
    start_date: course.start_date !== undefined ? course.start_date : existingCourse.start_date,
    end_date: course.end_date !== undefined ? course.end_date : existingCourse.end_date,
    dayOfWeek: course.dayOfWeek !== undefined ? course.dayOfWeek : existingCourse.dayOfWeek,
  };

  const conflictMessage = await checkConflict(mergedCourse);
  if (conflictMessage) {
    return { data: null, error: `CONFLICT:${conflictMessage}` };
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
