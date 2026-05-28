import * as z from 'zod';

export const enrollmentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive(),
});

export const updateEnrollmentSchema = enrollmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const enrollmentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type Enrollment = {
  studentId: number;
  courseId: number;
};

export type UpdateEnrollment = Partial<Enrollment>;
