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

    // Map to required external system format
    const payload = {
      classSectionId: `LHP-2026-${course.courseCode}-${String(course.id).padStart(2, '0')}`,
      subjectName: course.name,
      room: course.room ? {
        roomId: `ROOM-${course.room.name.replace(/\s+/g, '')}`,
        roomName: course.room.name,
      } : null,
      teacher: course.teacher ? {
        teacherId: course.teacher.teacherCode,
        fullName: course.teacher.name,
        email: course.teacher.email,
      } : null,
      schedules: [
        {
          dayOfWeek: course.start_date ? mapDayOfWeek(course.start_date) : 2,
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
      })),
    };

    // Simulate API request to external system
    // 85% success chance
    const isSuccess = Math.random() > 0.15;
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const message = isSuccess 
      ? `Đồng bộ lớp học ${payload.classSectionId} thành công qua hệ thống quản lý đào tạo khác.`
      : `Lỗi kết nối (Timeout): Hệ thống đích không phản hồi khi đồng bộ lớp ${payload.classSectionId}.`;

    // Save to sync logs in DB
    const log = await prisma.syncLog.create({
      data: {
        courseId: course.id,
        courseName: course.name,
        status,
        message,
      },
    });

    results.push({
      log,
      payload, // Return the payload so FE can show it
    });
  }

  return results;
};

export {
  handleGetSyncLogs,
  handleSyncCourses,
};
