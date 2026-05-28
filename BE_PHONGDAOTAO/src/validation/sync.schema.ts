import * as z from 'zod';

export const syncCoursesSchema = z.object({
  courseIds: z.array(z.coerce.number().int().positive()).min(1),
});

export type SyncCoursesPayload = z.infer<typeof syncCoursesSchema>;
