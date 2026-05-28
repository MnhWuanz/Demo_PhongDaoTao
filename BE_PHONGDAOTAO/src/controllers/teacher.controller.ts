import { Request, Response } from 'express';
import {
  handleCreateTeacher,
  handleDeleteTeacher,
  handleGetAllTeachers,
  handleGetTeacherById,
  handleUpdateTeacher,
} from 'services/teacher.service';
import { handleInternalError } from 'src/utils/api-response';
import {
  Teacher,
  teacherParamsSchema,
  teacherSchema,
  UpdateTeacher,
  updateTeacherSchema,
} from 'src/validation/teacher.schema';

const parseTeacherId = (req: Request, res: Response) => {
  const validatedParams = teacherParamsSchema.safeParse(req.params);

  if (!validatedParams.success) {
    res.status(400).json({
      message: 'Invalid teacher id',
      errors: validatedParams.error.errors,
    });
    return null;
  }

  return validatedParams.data.id;
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await handleGetAllTeachers();
    return res.status(200).json({ message: 'Success', data: teachers });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const teacherId = parseTeacherId(req, res);

    if (!teacherId) {
      return;
    }

    const teacher = await handleGetTeacherById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({ message: 'Success', data: teacher });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const validatedData = await teacherSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const newTeacher = await handleCreateTeacher(validatedData.data as Teacher);
    return res.status(201).json({ message: 'Success', data: newTeacher });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const teacherId = parseTeacherId(req, res);

    if (!teacherId) {
      return;
    }

    const validatedData = await updateTeacherSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const updatedTeacher = await handleUpdateTeacher(
      teacherId,
      validatedData.data as UpdateTeacher,
    );

    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({ message: 'Success', data: updatedTeacher });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const teacherId = parseTeacherId(req, res);

    if (!teacherId) {
      return;
    }

    const deletedTeacher = await handleDeleteTeacher(teacherId);

    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({ message: 'Success', data: deletedTeacher });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
