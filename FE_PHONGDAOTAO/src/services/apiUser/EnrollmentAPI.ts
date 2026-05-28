import axiosClient from './axiosClient';

export interface Enrollment {
  id?: number;
  studentId: number;
  courseId: number;
}

const enrollmentApi = {
  getAll: () => axiosClient.get('/enrollments'),
  getById: (id: number) => axiosClient.get(`/enrollments/${id}`),
  createEnrollment: (data: Enrollment) => axiosClient.post('/enrollments', data),
  updateEnrollment: (id: number, data: Enrollment) => axiosClient.put(`/enrollments/${id}`, data),
  deleteEnrollment: (id: number) => axiosClient.delete(`/enrollments/${id}`),
};

export default enrollmentApi;
