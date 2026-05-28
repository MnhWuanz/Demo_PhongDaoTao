import * as z from 'zod';

export const studentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  studentCode: z.string().min(2).max(50),
  class: z.string().min(1).max(100),
});

export const updateStudentSchema = studentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const studentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type Student = {
  name: string;
  email: string;
  studentCode: string;
  class: string;
};

export type UpdateStudent = Partial<Student>;
