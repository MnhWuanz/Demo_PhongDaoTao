import { Request, Response } from 'express';
import { handleGetSyncLogs, handleSyncCourses } from 'services/sync.service';
import { handleInternalError } from 'src/utils/api-response';
import { syncCoursesSchema } from 'src/validation/sync.schema';

export const getSyncLogs = async (req: Request, res: Response) => {
  try {
    const logs = await handleGetSyncLogs();
    return res.status(200).json({ message: 'Success', data: logs });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const syncCourses = async (req: Request, res: Response) => {
  try {
    const validatedData = await syncCoursesSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const results = await handleSyncCourses(validatedData.data.courseIds);
    return res.status(200).json({ message: 'Success', data: results });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
