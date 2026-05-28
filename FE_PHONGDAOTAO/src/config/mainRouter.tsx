import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import StudentManagement from '../pages/StudentManagement/StudentManagement';
import TeacherManagement from '../pages/TeacherManagement/TeacherManagement';
import RoomManagement from '../pages/RoomManagement/RoomManagement';
import CourseManagement from '../pages/CourseManagement/CourseManagement';
import EnrollmentManagement from '../pages/EnrollmentManagement/EnrollmentManagement';
import CourseSync from '../pages/CourseSync/CourseSync';

const MainRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<StudentManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="enrollments" element={<EnrollmentManagement />} />
          <Route path="sync" element={<CourseSync />} />
        </Route>
      </Routes>
    </>
  );
};

export default MainRouter;
