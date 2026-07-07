import axiosClient from './axiosClient';
import { Room } from './RoomAPI';
import { Shift } from './ShiftAPI';
import { Teacher } from './TeacherAPI';

export interface CourseSchedule {
  id?: number;
  roomId?: number | null;
  startShiftId?: number | null;
  endShiftId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  dayOfWeek?: number | null;
  room?: Room;
  startShift?: Shift;
  endShift?: Shift;
}

export interface Subject {
  id?: number;
  subjectCode: string;
  name: string;
}

export interface Course {
  id?: number;
  name: string;
  courseCode: string;
  teacherId: number;
  subjectId?: number;
  roomId?: number | null;
  startShiftId?: number | null;
  endShiftId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  dayOfWeek?: number | null;
  room?: Room;
  startShift?: Shift;
  endShift?: Shift;
  teacher?: Teacher;
  enrollments?: any[];
  schedules?: CourseSchedule[];
  subject?: Subject;
}

const courseApi = {
  getAll: () => axiosClient.get('/courses'),
  getById: (id: number) => axiosClient.get(`/courses/${id}`),
  createCourse: (data: Partial<Course>) => axiosClient.post('/courses', data),
  updateCourse: (id: number, data: Partial<Course>) => axiosClient.put(`/courses/${id}`, data),
  deleteCourse: (id: number) => axiosClient.delete(`/courses/${id}`),
  bulkEnroll: (id: number, studentIds: number[]) => axiosClient.post(`/courses/${id}/enroll`, { studentIds }),
};

export default courseApi;
