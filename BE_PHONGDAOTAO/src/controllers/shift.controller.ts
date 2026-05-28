import { Request, Response } from 'express';
import { handleGetAllShifts } from 'services/shift.service';
import { handleInternalError } from 'src/utils/api-response';

export const getAllShifts = async (req: Request, res: Response) => {
  try {
    const shifts = await handleGetAllShifts();
    return res.status(200).json({ message: 'Success', data: shifts });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
