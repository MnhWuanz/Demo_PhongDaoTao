import * as z from 'zod';

export const teacherSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  teacherCode: z.string().min(2).max(50),
});

export const updateTeacherSchema = teacherSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const teacherParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type Teacher = {
  name: string;
  email: string;
  teacherCode: string;
};

export type UpdateTeacher = Partial<Teacher>;
