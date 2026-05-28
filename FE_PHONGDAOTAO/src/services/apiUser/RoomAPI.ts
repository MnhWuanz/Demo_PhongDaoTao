import axiosClient from './axiosClient';

export interface Room {
  id?: number;
  name: string;
  capacity: number;
}

const roomApi = {
  getAll: () => axiosClient.get('/rooms'),
  getById: (id: number) => axiosClient.get(`/rooms/${id}`),
  createRoom: (data: Room) => axiosClient.post('/rooms', data),
  updateRoom: (id: number, data: Room) => axiosClient.put(`/rooms/${id}`, data),
  deleteRoom: (id: number) => axiosClient.delete(`/rooms/${id}`),
};

export default roomApi;
