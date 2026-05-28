import { prisma } from 'config/client';
import { Teacher, UpdateTeacher } from 'src/validation/teacher.schema';

import 'dotenv/config';

const handleGetAllTeachers = async () => {
  return await prisma.teacher.findMany();
};

const handleGetTeacherById = async (id: number) => {
  return await prisma.teacher.findUnique({
    where: { id },
    include: { courses: true },
  });
};

const handleCreateTeacher = async (teacher: Teacher) => {
  return await prisma.teacher.create({
    data: teacher,
  });
};

const handleUpdateTeacher = async (id: number, teacher: UpdateTeacher) => {
  const existingTeacher = await handleGetTeacherById(id);

  if (!existingTeacher) {
    return null;
  }

  return await prisma.teacher.update({
    where: { id },
    data: teacher,
  });
};

const handleDeleteTeacher = async (id: number) => {
  const existingTeacher = await handleGetTeacherById(id);

  if (!existingTeacher) {
    return null;
  }

  return await prisma.teacher.delete({
    where: { id },
  });
};

export {
  handleCreateTeacher,
  handleDeleteTeacher,
  handleGetAllTeachers,
  handleGetTeacherById,
  handleUpdateTeacher,
};
