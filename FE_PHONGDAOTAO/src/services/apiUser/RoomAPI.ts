import axiosClient from './axiosClient';

export interface Room {
  id?: number;
  roomCode: string;
  capacity: number;
}

const roomApi = {
  getAll: () => axiosClient.get('/rooms'),
  getById: (id: number) => axiosClient.get(`/rooms/${id}`),
  createRoom: (data: Omit<Room, 'id'>) => axiosClient.post('/rooms', data),
  updateRoom: (id: number, data: Partial<Omit<Room, 'id'>>) => axiosClient.put(`/rooms/${id}`, data),
  deleteRoom: (id: number) => axiosClient.delete(`/rooms/${id}`),
};

export default roomApi;
