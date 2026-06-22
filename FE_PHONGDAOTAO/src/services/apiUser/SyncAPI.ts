import axiosClient from './axiosClient';

export interface SyncLog {
  id: number;
  courseId: number;
  courseName: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  createdAt: string;
}

const syncApi = {
  getLogs: () => axiosClient.get('/sync-logs'),
  syncCourses: (courseIds: number[]) =>
    axiosClient.post('/sync', { courseIds }),
};
export default syncApi;
