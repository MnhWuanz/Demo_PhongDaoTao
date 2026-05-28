import { prisma } from 'config/client';
import { Student, UpdateStudent } from 'src/validation/student.schema';

import 'dotenv/config';

const handleGetAllStudents = async () => {
  return await prisma.student.findMany();
};

const handleGetStudentById = async (id: number) => {
  return await prisma.student.findUnique({
    where: { id },
  });
};

const handleCreateStudent = async (student: Student) => {
  return await prisma.student.create({
    data: student,
  });
};

const handleUpdateStudent = async (id: number, student: UpdateStudent) => {
  const existingStudent = await handleGetStudentById(id);

  if (!existingStudent) {
    return null;
  }

  return await prisma.student.update({
    where: { id },
    data: student,
  });
};

const handleDeleteStudent = async (id: number) => {
  const existingStudent = await handleGetStudentById(id);

  if (!existingStudent) {
    return null;
  }

  return await prisma.student.delete({
    where: { id },
  });
};

export {
  handleCreateStudent,
  handleDeleteStudent,
  handleGetAllStudents,
  handleGetStudentById,
  handleUpdateStudent,
};
