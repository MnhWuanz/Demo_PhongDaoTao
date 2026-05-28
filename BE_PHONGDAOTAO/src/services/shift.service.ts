import { prisma } from 'config/client';
import 'dotenv/config';

const handleGetAllShifts = async () => {
  return await prisma.shift.findMany();
};

export {
  handleGetAllShifts,
};
