import { prisma } from 'config/client';
import 'dotenv/config';

const SOURCE_SYSTEM = 'TRAINING_DEMO';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (time: string): string => {
  if (!time) return '00:00:00';
  const normalizedTime = time.replace(/h/i, ':');
  const parts = normalizedTime.split(':');
  const hh = parts[0]?.padStart(2, '0') || '00';
  const mm = parts[1]?.padStart(2, '0') || '00';
  const ss = parts[2]?.split('.')[0]?.padStart(2, '0') || '00';
  return `${hh}:${mm}:${ss}`;
};

const formatSyncedAt = (): string => {
  const now = new Date();
  // Format as ISO with +07:00 timezone offset
  const offset = '+07:00';
  const isoWithoutZ = now.toISOString().replace('Z', '').split('.')[0];
  return `${isoWithoutZ}${offset}`;
};

const handleGetSyncLogs = async () => {
  return await prisma.syncLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const handleSyncCourses = async (courseIds: number[]) => {
  // Fetch all course classes with their related data
  const courseClasses = await prisma.courseClass.findMany({
    where: { id: { in: courseIds } },
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

  if (courseClasses.length === 0) {
    return { message: 'Không tìm thấy lớp học phần nào để đồng bộ.', data: [] };
  }

  // Collect unique entities using Maps to de-duplicate
  const subjectsMap = new Map<number, any>();
  const teachersMap = new Map<number, any>();
  const roomsMap = new Map<number, any>();
  const shiftsMap = new Map<number, any>();
  const studentsMap = new Map<number, any>();
  const courseClassesArr: any[] = [];
  const courseSchedulesArr: any[] = [];
  const enrollmentsArr: any[] = [];

  for (const cc of courseClasses) {
    // Subject
    if (!subjectsMap.has(cc.subject.id)) {
      subjectsMap.set(cc.subject.id, {
        sourceSubjectId: cc.subject.id,
        subjectCode: cc.subject.subjectCode,
        name: cc.subject.name,
      });
    }

    // Teacher
    if (cc.teacher && !teachersMap.has(cc.teacher.id)) {
      teachersMap.set(cc.teacher.id, {
        sourceTeacherId: cc.teacher.id,
        teacherCode: cc.teacher.teacherCode,
        fullName: cc.teacher.fullName,
        email: cc.teacher.email,
      });
    }

    // CourseClass
    courseClassesArr.push({
      sourceCourseClassId: cc.id,
      courseCode: cc.courseCode,
      sourceSubjectId: cc.subjectId,
      sourceTeacherId: cc.teacherId,
    });

    // Schedules
    for (const sch of cc.schedules) {
      // Room
      if (sch.room && !roomsMap.has(sch.room.id)) {
        roomsMap.set(sch.room.id, {
          sourceRoomId: sch.room.id,
          room_code: sch.room.roomCode,
          capacity: sch.room.capacity,
        });
      }

      // Start Shift
      if (sch.startShift && !shiftsMap.has(sch.startShift.id)) {
        shiftsMap.set(sch.startShift.id, {
          sourceShiftId: sch.startShift.id,
          name: sch.startShift.name.split('(')[0].trim(),
          startTime: formatTime(sch.startShift.startTime),
          endTime: formatTime(sch.startShift.endTime),
        });
      }

      // End Shift (if different from start shift)
      if (sch.endShift && !shiftsMap.has(sch.endShift.id)) {
        shiftsMap.set(sch.endShift.id, {
          sourceShiftId: sch.endShift.id,
          name: sch.endShift.name.split('(')[0].trim(),
          startTime: formatTime(sch.endShift.startTime),
          endTime: formatTime(sch.endShift.endTime),
        });
      }

      courseSchedulesArr.push({
        sourceCourseScheduleId: sch.id,
        sourceCourseClassId: sch.courseClassId,
        sourceRoomId: sch.roomId,
        sourceStartShiftId: sch.startShiftId,
        sourceEndShiftId: sch.endShiftId,
        startDate: formatDate(sch.startDate),
        endDate: formatDate(sch.endDate),
        dayOfWeek: sch.dayOfWeek - 1,
      });
    }

    // Enrollments & Students
    for (const enr of cc.enrollments) {
      if (!studentsMap.has(enr.student.id)) {
        studentsMap.set(enr.student.id, {
          sourceStudentId: enr.student.id,
          student_code: enr.student.studentCode,
          full_name: enr.student.fullName,
          email: enr.student.email,
          class: enr.student.class,
        });
      }

      enrollmentsArr.push({
        sourceEnrollmentId: enr.id,
        sourceCourseClassId: enr.courseClassId,
        sourceStudentId: enr.studentId,
      });
    }
  }

  // Build the full sync payload
  const payload = {
    sourceSystem: SOURCE_SYSTEM,
    syncedAt: formatSyncedAt(),
    subjects: Array.from(subjectsMap.values()),
    teachers: Array.from(teachersMap.values()),
    rooms: Array.from(roomsMap.values()),
    shifts: Array.from(shiftsMap.values()),
    students: Array.from(studentsMap.values()),
    courseClasses: courseClassesArr,
    courseSchedules: courseSchedulesArr,
    enrollments: enrollmentsArr,
  };

  // Send sync request to external system with x-api-key
  let isSuccess = false;
  let syncMessage = '';

  try {
    const response = await fetch(`${process.env.SYSTEM_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SYNC_API_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    const resData = (await response.json()) as any;

    if (response.ok && resData.success) {
      isSuccess = true;
      syncMessage = `Đồng bộ ${courseClasses.length} lớp học phần thành công qua hệ thống quản lý đào tạo.`;
    } else {
      isSuccess = false;
      const details = resData.errors ? `: ${JSON.stringify(resData.errors)}` : '';
      syncMessage = `Hệ thống phản hồi lỗi: ${resData.message || response.statusText}${details}`;
    }
  } catch (err: any) {
    console.error('Sync request failed with error:', err);
    isSuccess = false;
    syncMessage = `Lỗi kết nối: Hệ thống đích không phản hồi khi đồng bộ. Chi tiết: ${err.message}`;
  }

  const status = isSuccess ? 'SUCCESS' : 'FAILED';

  // Save sync logs for each course
  const results = [];
  for (const cc of courseClasses) {
    const log = await prisma.syncLog.create({
      data: {
        courseId: cc.id,
        courseName: cc.subject.name,
        status,
        message: syncMessage,
      },
    });
    results.push({ log });
  }

  return {
    status,
    message: syncMessage,
    payload,
    logs: results,
  };
};

export { handleGetSyncLogs, handleSyncCourses };
