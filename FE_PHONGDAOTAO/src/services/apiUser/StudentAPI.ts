import axiosClient from './axiosClient';

export interface Student {
  id?: number;
  name: string;
  email: string;
  studentCode: string;
  class: string;
}

const studentApi = {
  getAll: () => axiosClient.get('/students'),
  getById: (id: number) => axiosClient.get(`/students/${id}`),
  createStudent: (data: Student) => axiosClient.post('/students', data),
  updateStudent: (id: number, data: Student) => axiosClient.put(`/students/${id}`, data),
  deleteStudent: (id: number) => axiosClient.delete(`/students/${id}`),
};

export default studentApi;
