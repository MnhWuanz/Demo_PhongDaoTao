import { Request, Response } from 'express';
import {
  handleCreateEnrollment,
  handleDeleteEnrollment,
  handleGetAllEnrollments,
  handleGetEnrollmentById,
  handleUpdateEnrollment,
} from 'services/enrollment.service';
import {
  getRelationErrorMessage,
  handleInternalError,
} from 'src/utils/api-response';
import {
  Enrollment,
  enrollmentParamsSchema,
  enrollmentSchema,
  UpdateEnrollment,
  updateEnrollmentSchema,
} from 'src/validation/enrollment.schema';

const parseEnrollmentId = (req: Request, res: Response) => {
  const validatedParams = enrollmentParamsSchema.safeParse(req.params);

  if (!validatedParams.success) {
    res.status(400).json({
      message: 'Invalid enrollment id',
      errors: validatedParams.error.errors,
    });
    return null;
  }

  return validatedParams.data.id;
};

export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const enrollments = await handleGetAllEnrollments();
    return res.status(200).json({ message: 'Success', data: enrollments });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const enrollmentId = parseEnrollmentId(req, res);

    if (!enrollmentId) {
      return;
    }

    const enrollment = await handleGetEnrollmentById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    return res.status(200).json({ message: 'Success', data: enrollment });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const validatedData = await enrollmentSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const result = await handleCreateEnrollment(
      validatedData.data as Enrollment,
    );

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

export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const enrollmentId = parseEnrollmentId(req, res);

    if (!enrollmentId) {
      return;
    }

    const validatedData = await updateEnrollmentSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const result = await handleUpdateEnrollment(
      enrollmentId,
      validatedData.data as UpdateEnrollment,
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

export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    const enrollmentId = parseEnrollmentId(req, res);

    if (!enrollmentId) {
      return;
    }

    const deletedEnrollment = await handleDeleteEnrollment(enrollmentId);

    if (!deletedEnrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    return res
      .status(200)
      .json({ message: 'Success', data: deletedEnrollment });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
