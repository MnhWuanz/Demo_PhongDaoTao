import axiosClient from './axiosClient';

export interface Teacher {
  id?: number;
  fullName: string;
  teacherCode: string;
  email: string;
}

const teacherApi = {
  getAll: () => axiosClient.get('/teachers'),
  getById: (id: number) => axiosClient.get(`/teachers/${id}`),
  createTeacher: (data: Omit<Teacher, 'id'>) => axiosClient.post('/teachers', data),
  updateTeacher: (id: number, data: Partial<Omit<Teacher, 'id'>>) => axiosClient.put(`/teachers/${id}`, data),
  deleteTeacher: (id: number) => axiosClient.delete(`/teachers/${id}`),
};

export default teacherApi;
