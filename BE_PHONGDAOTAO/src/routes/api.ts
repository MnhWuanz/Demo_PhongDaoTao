import express, { Express } from 'express';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  bulkEnroll,
} from 'controllers/course.controller';
import {
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from 'controllers/enrollment.controller';
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
} from 'controllers/room.controller';
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from 'controllers/student.controller';
import {
  createTeacher,
  deleteTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
} from 'controllers/teacher.controller';
import { getAllShifts } from 'controllers/shift.controller';
import {
  checkSyncConnection,
  getSyncLogs,
  syncCourses,
} from 'controllers/sync.controller';

const router = express.Router();

const apiRoutes = (app: Express) => {
  /// Student routes
  router.get('/students', getAllStudents);
  router.get('/students/:id', getStudentById);
  router.post('/students', createStudent);
  router.put('/students/:id', updateStudent);
  router.patch('/students/:id', updateStudent);
  router.delete('/students/:id', deleteStudent);

  /// Teacher routes
  router.get('/teachers', getAllTeachers);
  router.get('/teachers/:id', getTeacherById);
  router.post('/teachers', createTeacher);
  router.put('/teachers/:id', updateTeacher);
  router.patch('/teachers/:id', updateTeacher);
  router.delete('/teachers/:id', deleteTeacher);

  /// Room routes
  router.get('/rooms', getAllRooms);
  router.get('/rooms/:id', getRoomById);
  router.post('/rooms', createRoom);
  router.put('/rooms/:id', updateRoom);
  router.patch('/rooms/:id', updateRoom);
  router.delete('/rooms/:id', deleteRoom);

  /// Course routes
  router.get('/courses', getAllCourses);
  router.get('/courses/:id', getCourseById);
  router.post('/courses', createCourse);
  router.put('/courses/:id', updateCourse);
  router.patch('/courses/:id', updateCourse);
  router.delete('/courses/:id', deleteCourse);
  router.post('/courses/:id/enroll', bulkEnroll);

  /// Enrollment routes
  router.get('/enrollments', getAllEnrollments);
  router.get('/enrollments/:id', getEnrollmentById);
  router.post('/enrollments', createEnrollment);
  router.put('/enrollments/:id', updateEnrollment);
  router.patch('/enrollments/:id', updateEnrollment);
  router.delete('/enrollments/:id', deleteEnrollment);

  /// Shift routes
  router.get('/shifts', getAllShifts);

  /// Sync routes
  router.post('/sync', syncCourses);
  router.get('/sync/check-connection', checkSyncConnection);
  router.get('/sync-logs', getSyncLogs);
  app.use('/api', router);
};
export default apiRoutes;
