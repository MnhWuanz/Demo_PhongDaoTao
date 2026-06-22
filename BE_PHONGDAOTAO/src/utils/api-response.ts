import { Prisma } from '@prisma/client';
import { Response } from 'express';

export const handleInternalError = (res: Response, error: unknown) => {
  console.error(error);

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return res.status(409).json({
      message: 'Cannot modify this record because related records exist',
    });
  }

  return res.status(500).json({ message: 'Internal server error' });
};

export const getRelationErrorMessage = (error?: string) => {
  if (error && error.startsWith('CONFLICT:')) {
    return error.substring('CONFLICT:'.length).trim();
  }
  switch (error) {
    case 'TEACHER_NOT_FOUND':
      return 'Teacher not found';
    case 'STUDENT_NOT_FOUND':
      return 'Student not found';
    case 'COURSE_NOT_FOUND':
      return 'Course not found';
    case 'ENROLLMENT_NOT_FOUND':
      return 'Enrollment not found';
    case 'ROOM_NOT_FOUND':
      return 'Room not found';
    case 'SHIFT_NOT_FOUND':
      return 'Shift not found';
    default:
      return 'Related record not found';
  }
};
