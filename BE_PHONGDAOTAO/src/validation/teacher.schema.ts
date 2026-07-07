import * as z from 'zod';

export const teacherSchema = z.object({
  fullName: z.string().min(2).max(100),
  teacherCode: z.string().min(2).max(100),
  email: z.string().email('Email không đúng định dạng'),
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
  fullName: string;
  teacherCode: string;
  email: string;
};

export type UpdateTeacher = Partial<Teacher>;
