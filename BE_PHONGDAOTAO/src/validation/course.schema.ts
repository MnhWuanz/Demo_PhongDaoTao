import * as z from 'zod';

export const courseSchema = z.object({
  name: z.string().min(2).max(100),
  courseCode: z.string().min(2).max(10),
  teacherId: z.coerce.number().int().positive(),
  roomId: z.coerce.number().int().positive().nullable().optional(),
  startShiftId: z.coerce.number().int().positive().nullable().optional(),
  endShiftId: z.coerce.number().int().positive().nullable().optional(),
  start_date: z.coerce.date().nullable().optional(),
  end_date: z.coerce.date().nullable().optional(),
  dayOfWeek: z.coerce.number().int().min(2).max(8).nullable().optional(),
});

export const updateCourseSchema = courseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const courseParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type Course = {
  name: string;
  courseCode: string;
  teacherId: number;
  roomId?: number | null;
  startShiftId?: number | null;
  endShiftId?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  dayOfWeek?: number | null;
};

export type UpdateCourse = Partial<Course>;
