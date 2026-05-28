import axiosClient from './axiosClient';

export interface Shift {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
}

const shiftApi = {
  getAll: () => axiosClient.get('/shifts'),
};

export default shiftApi;
