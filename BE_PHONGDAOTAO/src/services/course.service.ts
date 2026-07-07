import { prisma } from 'config/client';
import { Course, UpdateCourse } from 'src/validation/course.schema';

import 'dotenv/config';

const handleGetAllCourses = async () => {
  const classes = await prisma.courseClass.findMany({
    include: {
      subject: true,
      teacher: true,
      schedules: {
        include: {
          room: true,
          startShift: true,
          endShift: true,
        },
      },
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  });

  return classes.map((cc) => {
    const firstSchedule = cc.schedules[0] || null;
    return {
      id: cc.id,
      courseCode: cc.courseCode,
      subjectId: cc.subjectId,
      teacherId: cc.teacherId,
      name: cc.subject.name,
      subject: cc.subject,
      teacher: cc.teacher,
      enrollments: cc.enrollments,
      schedules: cc.schedules,
      roomId: firstSchedule?.roomId || null,
      room: firstSchedule?.room || null,
      startShiftId: firstSchedule?.startShiftId || null,
      startShift: firstSchedule?.startShift || null,
      endShiftId: firstSchedule?.endShiftId || null,
      endShift: firstSchedule?.endShift || null,
      startDate: firstSchedule?.startDate || null,
      endDate: firstSchedule?.endDate || null,
      dayOfWeek: firstSchedule?.dayOfWeek || null,
    };
  });
};

const handleGetCourseById = async (id: number) => {
  const cc = await prisma.courseClass.findUnique({
    where: { id },
    include: {
      subject: true,
      teacher: true,
      schedules: {
        include: {
          room: true,
          startShift: true,
          endShift: true,
        },
      },
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!cc) return null;

  const firstSchedule = cc.schedules[0] || null;
  return {
    id: cc.id,
    courseCode: cc.courseCode,
    subjectId: cc.subjectId,
    teacherId: cc.teacherId,
    name: cc.subject.name,
    subject: cc.subject,
    teacher: cc.teacher,
    enrollments: cc.enrollments,
    schedules: cc.schedules,
    roomId: firstSchedule?.roomId || null,
    room: firstSchedule?.room || null,
    startShiftId: firstSchedule?.startShiftId || null,
    startShift: firstSchedule?.startShift || null,
    endShiftId: firstSchedule?.endShiftId || null,
    endShift: firstSchedule?.endShift || null,
    startDate: firstSchedule?.startDate || null,
    endDate: firstSchedule?.endDate || null,
    dayOfWeek: firstSchedule?.dayOfWeek || null,
  };
};

const checkConflict = async (course: {
  id?: number;
  roomId?: number | null;
  teacherId: number;
  startShiftId?: number | null;
  endShiftId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  dayOfWeek?: number | null;
}) => {
  if (!course.startShiftId || !course.endShiftId || !course.startDate || !course.endDate || !course.dayOfWeek) {
    return null;
  }

  const newStart = new Date(course.startDate);
  const newEnd = new Date(course.endDate);

  const existingSchedules = await prisma.courseSchedule.findMany({
    where: {
      courseClassId: course.id ? { not: course.id } : undefined,
      dayOfWeek: course.dayOfWeek,
    },
    include: {
      courseClass: {
        include: {
          subject: true,
          teacher: true,
        },
      },
      room: true,
      startShift: true,
      endShift: true,
    },
  });

  for (const existing of existingSchedules) {
    const extStart = new Date(existing.startDate);
    const extEnd = new Date(existing.endDate);

    // Overlap dates: !(newEnd < extStart || newStart > extEnd)
    const dateOverlap = !(newEnd < extStart || newStart > extEnd);
    if (!dateOverlap) continue;

    // Overlap shifts: !(endA < startB || startA > endB)
    const startA = course.startShiftId;
    const endA = course.endShiftId;
    const startB = existing.startShiftId;
    const endB = existing.endShiftId;

    const shiftOverlap = !(endA < startB || startA > endB);
    if (!shiftOverlap) continue;

    // Teacher conflict
    if (existing.courseClass.teacherId === course.teacherId) {
      const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
      return `Giảng viên ${existing.courseClass.teacher.fullName} đã có lịch dạy lớp "${existing.courseClass.subject.name}" (${existing.courseClass.courseCode}) vào Thứ ${course.dayOfWeek} (Tiết ${existing.startShiftId}-${existing.endShiftId}) từ ${formatDate(extStart)} đến ${formatDate(extEnd)}.`;
    }

    // Room conflict
    if (course.roomId && existing.roomId === course.roomId) {
      const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
      return `Phòng ${existing.room?.roomCode || existing.roomId} đã được sử dụng cho lớp "${existing.courseClass.subject.name}" (${existing.courseClass.courseCode}) của giảng viên ${existing.courseClass.teacher.fullName} vào Thứ ${course.dayOfWeek} (Tiết ${existing.startShiftId}-${existing.endShiftId}) từ ${formatDate(extStart)} đến ${formatDate(extEnd)}.`;
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

  // Find or create subject based on courseCode (which functions as subjectCode)
  let subject = await prisma.subject.findUnique({
    where: { subjectCode: course.courseCode },
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        subjectCode: course.courseCode,
        name: course.name,
      },
    });
  } else if (subject.name !== course.name) {
    subject = await prisma.subject.update({
      where: { id: subject.id },
      data: { name: course.name },
    });
  }

  // Create CourseClass
  const newCourseClass = await prisma.courseClass.create({
    data: {
      courseCode: course.courseCode,
      subjectId: subject.id,
      teacherId: course.teacherId,
    },
  });

  // Create CourseSchedule if schedule data provided
  if (course.roomId && course.startShiftId && course.endShiftId && course.startDate && course.endDate && course.dayOfWeek) {
    await prisma.courseSchedule.create({
      data: {
        courseClassId: newCourseClass.id,
        roomId: course.roomId,
        startShiftId: course.startShiftId,
        endShiftId: course.endShiftId,
        startDate: course.startDate,
        endDate: course.endDate,
        dayOfWeek: course.dayOfWeek,
      },
    });
  }

  const fullCourse = await handleGetCourseById(newCourseClass.id);
  return { data: fullCourse };
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
    startDate: course.startDate !== undefined ? course.startDate : existingCourse.startDate,
    endDate: course.endDate !== undefined ? course.endDate : existingCourse.endDate,
    dayOfWeek: course.dayOfWeek !== undefined ? course.dayOfWeek : existingCourse.dayOfWeek,
  };

  const conflictMessage = await checkConflict(mergedCourse);
  if (conflictMessage) {
    return { data: null, error: `CONFLICT:${conflictMessage}` };
  }

  // Handle Subject update or creation
  let subjectId = existingCourse.subjectId;
  if (course.courseCode || course.name) {
    const finalCode = course.courseCode || existingCourse.courseCode;
    const finalName = course.name || existingCourse.name;

    let subject = await prisma.subject.findUnique({
      where: { subjectCode: finalCode },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          subjectCode: finalCode,
          name: finalName,
        },
      });
    } else if (subject.name !== finalName) {
      subject = await prisma.subject.update({
        where: { id: subject.id },
        data: { name: finalName },
      });
    }
    subjectId = subject.id;
  }

  // Update CourseClass
  await prisma.courseClass.update({
    where: { id },
    data: {
      courseCode: course.courseCode !== undefined ? course.courseCode : undefined,
      teacherId: course.teacherId !== undefined ? course.teacherId : undefined,
      subjectId,
    },
  });

  // Update or create CourseSchedule
  const firstSchedule = existingCourse.schedules[0];
  if (firstSchedule) {
    await prisma.courseSchedule.update({
      where: { id: firstSchedule.id },
      data: {
        roomId: course.roomId !== undefined ? course.roomId : undefined,
        startShiftId: course.startShiftId !== undefined ? course.startShiftId : undefined,
        endShiftId: course.endShiftId !== undefined ? course.endShiftId : undefined,
        startDate: course.startDate !== undefined ? course.startDate : undefined,
        endDate: course.endDate !== undefined ? course.endDate : undefined,
        dayOfWeek: course.dayOfWeek !== undefined ? course.dayOfWeek : undefined,
      },
    });
  } else if (course.roomId && course.startShiftId && course.endShiftId && course.startDate && course.endDate && course.dayOfWeek) {
    await prisma.courseSchedule.create({
      data: {
        courseClassId: id,
        roomId: course.roomId,
        startShiftId: course.startShiftId,
        endShiftId: course.endShiftId,
        startDate: course.startDate,
        endDate: course.endDate,
        dayOfWeek: course.dayOfWeek,
      },
    });
  }

  const fullCourse = await handleGetCourseById(id);
  return { data: fullCourse };
};

const handleDeleteCourse = async (id: number) => {
  const existingCourse = await handleGetCourseById(id);

  if (!existingCourse) {
    return null;
  }

  return await prisma.courseClass.delete({
    where: { id },
  });
};

const handleBulkEnroll = async (courseId: number, studentIds: number[]) => {
  const course = await prisma.courseClass.findUnique({
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
      where: { studentId, courseClassId: courseId },
    });

    if (!existing) {
      const enrollment = await prisma.enrollment.create({
        data: { studentId, courseClassId: courseId },
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
