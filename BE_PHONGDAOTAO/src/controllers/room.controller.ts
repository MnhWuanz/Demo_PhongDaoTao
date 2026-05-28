import { Request, Response } from 'express';
import {
  handleCreateRoom,
  handleDeleteRoom,
  handleGetAllRooms,
  handleGetRoomById,
  handleUpdateRoom,
} from 'services/room.service';
import { handleInternalError } from 'src/utils/api-response';
import {
  Room,
  roomParamsSchema,
  roomSchema,
  UpdateRoom,
  updateRoomSchema,
} from 'src/validation/room.schema';

const parseRoomId = (req: Request, res: Response) => {
  const validatedParams = roomParamsSchema.safeParse(req.params);

  if (!validatedParams.success) {
    res.status(400).json({
      message: 'Invalid room id',
      errors: validatedParams.error.errors,
    });
    return null;
  }

  return validatedParams.data.id;
};

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await handleGetAllRooms();
    return res.status(200).json({ message: 'Success', data: rooms });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const roomId = parseRoomId(req, res);

    if (!roomId) {
      return;
    }

    const room = await handleGetRoomById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json({ message: 'Success', data: room });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const validatedData = await roomSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const newRoom = await handleCreateRoom(validatedData.data as Room);
    return res.status(201).json({ message: 'Success', data: newRoom });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const roomId = parseRoomId(req, res);

    if (!roomId) {
      return;
    }

    const validatedData = await updateRoomSchema.safeParseAsync(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validatedData.error.errors,
      });
    }

    const updatedRoom = await handleUpdateRoom(
      roomId,
      validatedData.data as UpdateRoom,
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json({ message: 'Success', data: updatedRoom });
  } catch (error) {
    return handleInternalError(res, error);
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = parseRoomId(req, res);

    if (!roomId) {
      return;
    }

    const deletedRoom = await handleDeleteRoom(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json({ message: 'Success', data: deletedRoom });
  } catch (error) {
    return handleInternalError(res, error);
  }
};
