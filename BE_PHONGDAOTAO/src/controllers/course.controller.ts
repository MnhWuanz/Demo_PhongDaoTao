import { Request, Response } from 'express';
import {
  handleCreateCourse,
  handleDeleteCourse,
  handleGetAllCourses,
  handleGetCourseById,
  handleUpdateCourse,
  handleBulkEnroll,
} from 'services/course.service';
import * as z from 'zod';
const bulkEnrollSchema = z.object({
  studentIds: z.array(z.coerce.number().int().positive()).min(1),
});
import {
  getRelationErrorMessage,
  handleInternalError,
} from 'src/utils/api-response';
import {
  Course,
  courseParamsSchema,
  courseSchema,
  UpdateCourse,
  updateCourseSchema,
} from 'src/validation/course.schema';

const parseCourseId = (req: Request, res: Response) => {
  const validatedParams = courseParamsSchema.safeParse(req.params);

  if (!validatedParams.success) {
    res.status(400).json({
      message: 'Invalid course id',
      errors: validatedParams.error.errors,
    });
    return null;
  }

  return validatedParams.data.id;
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await handleGetAllCourses();
    return res.status(200).json({ message: 'Success', data: courses });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = parseCourseId(req, res);

    if (!courseId) {
      return;
    }

    const course = await handleGetCourseById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json({ message: 'Success', data: course });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const validatedData = await courseSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const result = await handleCreateCourse(validatedData.data as Course);

    if (!result.data) {
      return res.status(404).json({
        message: getRelationErrorMessage(result.error),
      });
    }

    return res.status(201).json({ message: 'Success', data: result.data });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = parseCourseId(req, res);

    if (!courseId) {
      return;
    }

    const validatedData = await updateCourseSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const result = await handleUpdateCourse(
      courseId,
      validatedData.data as UpdateCourse,
    );

    if (!result.data) {
      return res.status(404).json({
        message: getRelationErrorMessage(result.error),
      });
    }

    return res.status(200).json({ message: 'Success', data: result.data });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = parseCourseId(req, res);

    if (!courseId) {
      return;
    }

    const deletedCourse = await handleDeleteCourse(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json({ message: 'Success', data: deletedCourse });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const bulkEnroll = async (req: Request, res: Response) => {
  try {
    const courseId = parseCourseId(req, res);
    if (!courseId) return;

    const validatedData = bulkEnrollSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const result = await handleBulkEnroll(courseId, validatedData.data.studentIds);
    if (result.error) {
      return res.status(404).json({
        message: getRelationErrorMessage(result.error),
      });
    }

    return res.status(200).json({ message: 'Success', data: result.data });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
