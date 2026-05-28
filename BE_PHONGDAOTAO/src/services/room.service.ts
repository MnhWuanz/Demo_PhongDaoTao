import { prisma } from 'config/client';
import { Room, UpdateRoom } from 'src/validation/room.schema';

import 'dotenv/config';

const handleGetAllRooms = async () => {
  return await prisma.room.findMany();
};

const handleGetRoomById = async (id: number) => {
  return await prisma.room.findUnique({
    where: { id },
  });
};

const handleCreateRoom = async (room: Room) => {
  return await prisma.room.create({
    data: room,
  });
};

const handleUpdateRoom = async (id: number, room: UpdateRoom) => {
  const existingRoom = await handleGetRoomById(id);

  if (!existingRoom) {
    return null;
  }

  return await prisma.room.update({
    where: { id },
    data: room,
  });
};

const handleDeleteRoom = async (id: number) => {
  const existingRoom = await handleGetRoomById(id);

  if (!existingRoom) {
    return null;
  }

  return await prisma.room.delete({
    where: { id },
  });
};

export {
  handleCreateRoom,
  handleDeleteRoom,
  handleGetAllRooms,
  handleGetRoomById,
  handleUpdateRoom,
};
