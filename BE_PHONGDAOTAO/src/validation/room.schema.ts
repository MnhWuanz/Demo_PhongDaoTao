import * as z from 'zod';

export const roomSchema = z.object({
  roomCode: z.string().min(1).max(100),
  capacity: z.coerce.number().int().positive(),
});

export const updateRoomSchema = roomSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const roomParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type Room = {
  roomCode: string;
  capacity: number;
};

export type UpdateRoom = Partial<Room>;
