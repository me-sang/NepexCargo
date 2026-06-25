import { z } from 'zod';

export const loginSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginSuperAdminDTO = z.infer<typeof loginSuperAdminSchema>;

export const createSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateSuperAdminDTO = z.infer<typeof createSuperAdminSchema>;
