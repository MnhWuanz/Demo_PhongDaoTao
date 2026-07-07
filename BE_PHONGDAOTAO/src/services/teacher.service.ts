import { prisma } from 'config/client';
import { Teacher, UpdateTeacher } from 'src/validation/teacher.schema';

import 'dotenv/config';

const handleGetAllTeachers = async () => {
  return await prisma.teacher.findMany();
};

const handleGetTeacherById = async (id: number) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          subject: true,
        },
      },
    },
  });
  if (!teacher) return null;
  return {
    ...teacher,
    courses: teacher.classes.map((cc) => ({
      id: cc.id,
      courseCode: cc.courseCode,
      name: cc.subject.name,
    })),
  };
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
