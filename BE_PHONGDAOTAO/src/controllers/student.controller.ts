import { Request, Response } from 'express';
import {
  handleCreateStudent,
  handleDeleteStudent,
  handleGetAllStudents,
  handleGetStudentById,
  handleUpdateStudent,
} from 'services/student.service';
import { handleInternalError } from 'src/utils/api-response';
import {
  studentParamsSchema,
  Student,
  UpdateStudent,
  studentSchema,
  updateStudentSchema,
} from 'src/validation/student.schema';

const parseStudentId = (req: Request, res: Response) => {
  const validatedParams = studentParamsSchema.safeParse(req.params);

  if (!validatedParams.success) {
    res.status(400).json({
      message: 'Invalid student id',
      errors: validatedParams.error.errors,
    });
    return null;
  }

  return validatedParams.data.id;
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await handleGetAllStudents();
    return res.status(200).json({ message: 'Success', data: students });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const studentId = parseStudentId(req, res);

    if (!studentId) {
      return;
    }

    const student = await handleGetStudentById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ message: 'Success', data: student });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const validatedData = await studentSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const newStudent = await handleCreateStudent(validatedData.data as Student);
    return res.status(201).json({ message: 'Success', data: newStudent });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseStudentId(req, res);

    if (!studentId) {
      return;
    }

    const validatedData = await updateStudentSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const updatedStudent = await handleUpdateStudent(
      studentId,
      validatedData.data as UpdateStudent,
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ message: 'Success', data: updatedStudent });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseStudentId(req, res);

    if (!studentId) {
      return;
    }

    const deletedStudent = await handleDeleteStudent(studentId);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ message: 'Success', data: deletedStudent });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
