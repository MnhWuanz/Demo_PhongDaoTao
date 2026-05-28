/// <reference path="./types/index.d.ts" />

import express from 'express';
import 'dotenv/config';
import apiRoutes from 'routes/api';
import cors from 'cors';
import { prisma } from 'config/client';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

apiRoutes(app);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`My app is running on port:${PORT}`);
  console.log('env port: ' + process.env.PORT);

  // Auto-seed shifts if empty
  try {
    const shiftCount = await prisma.shift.count();
    if (shiftCount === 0) {
      console.log('Seeding default shifts...');
      await prisma.shift.createMany({
        data: [
          {
            id: 1,
            name: 'Tiết 1 (07h00 - 07h50)',
            startTime: '07h00',
            endTime: '07h50',
          },
          {
            id: 2,
            name: 'Tiết 2 (07h50 - 08h40)',
            startTime: '07h50',
            endTime: '08h40',
          },
          {
            id: 3,
            name: 'Tiết 3 (08h40 - 09h30)',
            startTime: '08h40',
            endTime: '09h30',
          },
          {
            id: 4,
            name: 'Tiết 4 (09h35 - 10h25)',
            startTime: '09h35',
            endTime: '10h25',
          },
          {
            id: 5,
            name: 'Tiết 5 (10h25 - 11h15)',
            startTime: '10h25',
            endTime: '11h15',
          },
          {
            id: 6,
            name: 'Tiết 6 (11h15 - 12h05)',
            startTime: '11h15',
            endTime: '12h05',
          },
          {
            id: 7,
            name: 'Tiết 7 (12h35 - 13h25)',
            startTime: '12h35',
            endTime: '13h25',
          },
          {
            id: 8,
            name: 'Tiết 8 (13h25 - 14h15)',
            startTime: '13h25',
            endTime: '14h15',
          },
          {
            id: 9,
            name: 'Tiết 9 (14h15 - 15h05)',
            startTime: '14h15',
            endTime: '15h05',
          },
          {
            id: 10,
            name: 'Tiết 10 (15h10 - 16h00)',
            startTime: '15h10',
            endTime: '16h00',
          },
          {
            id: 11,
            name: 'Tiết 11 (16h00 - 16h50)',
            startTime: '16h00',
            endTime: '16h50',
          },
          {
            id: 12,
            name: 'Tiết 12 (16h50 - 17h40)',
            startTime: '16h50',
            endTime: '17h40',
          },
          {
            id: 13,
            name: 'Tiết 13 (17h45 - 18h35)',
            startTime: '17h45',
            endTime: '18h35',
          },
          {
            id: 14,
            name: 'Tiết 14 (18h35 - 19h25)',
            startTime: '18h35',
            endTime: '19h25',
          },
          {
            id: 15,
            name: 'Tiết 15 (19h25 - 20h15)',
            startTime: '19h25',
            endTime: '20h15',
          },
        ],
      });
      console.log('Seeding default shifts completed.');
    }
  } catch (error) {
    console.error('Error seeding default shifts:', error);
  }
});
