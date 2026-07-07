import axiosClient from './axiosClient';

export interface Student {
  id?: number;
  fullName: string;
  email: string;
  studentCode: string;
  class: string;
  isFaceRegistered?: boolean;
}

const studentApi = {
  getAll: () => axiosClient.get('/students'),
  getById: (id: number) => axiosClient.get(`/students/${id}`),
  createStudent: (data: Omit<Student, 'id'>) => axiosClient.post('/students', data),
  updateStudent: (id: number, data: Partial<Omit<Student, 'id'>>) => axiosClient.put(`/students/${id}`, data),
  deleteStudent: (id: number) => axiosClient.delete(`/students/${id}`),
};

export default studentApi;
