import { prisma } from 'config/client';
import 'dotenv/config';

const mapDayOfWeek = (date: Date): number => {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  if (day === 0) return 8; // Sunday is 8 in Vietnamese standard
  return day + 1; // Monday is 2, Tuesday is 3, etc.
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const handleGetSyncLogs = async () => {
  return await prisma.syncLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const handleSyncCourses = async (courseIds: number[]) => {
  const results = [];
  for (const id of courseIds) {
    const course = await prisma.course.findUnique({
      where: { id },
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

    if (!course) {
      continue;
    }

    const payload = {
      classSectionId: `LHP-2026-${course.courseCode}-${String(course.id).padStart(2, '0')}`,
      subjectName: course.name,
      room: course.room
        ? {
            roomId: `ROOM-${course.room.name.replace(/\s+/g, '')}`,
            roomName: course.room.name,
          }
        : null,
      teacher: course.teacher
        ? {
            teacherId: course.teacher.teacherCode,
            fullName: course.teacher.name,
            email: course.teacher.email,
          }
        : null,
      schedules: [
        {
          dayOfWeek:
            course.dayOfWeek ||
            (course.start_date ? mapDayOfWeek(course.start_date) : 2),
          startTime: course.startShift?.startTime || '07:00',
          endTime: course.endShift?.endTime || '09:30',
          startDate: course.start_date ? formatDate(course.start_date) : '',
          endDate: course.end_date ? formatDate(course.end_date) : '',
        },
      ],
      students: course.enrollments.map((e) => ({
        studentId: e.student.studentCode,
        fullName: e.student.name,
        email: e.student.email,
        class: e.student.class,
      })),
    };

    let isSuccess = false;
    let syncMessage = '';
    try {
      const response = await fetch('http://localhost:8080/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = (await response.json()) as any;
      if (response.ok && resData.success) {
        isSuccess = true;
        syncMessage = `Đồng bộ lớp học ${payload.classSectionId} thành công qua hệ thống quản lý đào tạo khác.`;
      } else {
        isSuccess = false;
        syncMessage = `Hệ thống phản hồi lỗi: ${resData.message || response.statusText}`;
      }
    } catch (err: any) {
      isSuccess = false;
      syncMessage = `Lỗi kết nối: Hệ thống đích không phản hồi khi đồng bộ lớp ${payload.classSectionId}.`;
    }

    const status = isSuccess ? 'SUCCESS' : 'FAILED';

    // Save to sync logs in DB
    const log = await prisma.syncLog.create({
      data: {
        courseId: course.id,
        courseName: course.name,
        status,
        message: syncMessage,
      },
    });
    results.push({
      log,
      payload,
    });
  }

  return results;
};

export { handleGetSyncLogs, handleSyncCourses };
