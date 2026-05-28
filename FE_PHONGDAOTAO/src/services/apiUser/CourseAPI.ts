import axiosClient from './axiosClient';
import { Room } from './RoomAPI';
import { Shift } from './ShiftAPI';
import { Teacher } from './TeacherAPI';

export interface Course {
  id?: number;
  name: string;
  courseCode: string;
  teacherId: number;
  roomId?: number | null;
  startShiftId?: number | null;
  endShiftId?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  room?: Room;
  startShift?: Shift;
  endShift?: Shift;
  teacher?: Teacher;
  enrollments?: any[];
}

const courseApi = {
  getAll: () => axiosClient.get('/courses'),
  getById: (id: number) => axiosClient.get(`/courses/${id}`),
  createCourse: (data: Course) => axiosClient.post('/courses', data),
  updateCourse: (id: number, data: Course) => axiosClient.put(`/courses/${id}`, data),
  deleteCourse: (id: number) => axiosClient.delete(`/courses/${id}`),
  bulkEnroll: (id: number, studentIds: number[]) => axiosClient.post(`/courses/${id}/enroll`, { studentIds }),
};

export default courseApi;
