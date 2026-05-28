import axiosClient from './axiosClient';

export interface Teacher {
  id?: number;
  name: string;
  email: string;
  teacherCode: string;
}

const teacherApi = {
  getAll: () => axiosClient.get('/teachers'),
  getById: (id: number) => axiosClient.get(`/teachers/${id}`),
  createTeacher: (data: Teacher) => axiosClient.post('/teachers', data),
  updateTeacher: (id: number, data: Teacher) => axiosClient.put(`/teachers/${id}`, data),
  deleteTeacher: (id: number) => axiosClient.delete(`/teachers/${id}`),
};

export default teacherApi;
