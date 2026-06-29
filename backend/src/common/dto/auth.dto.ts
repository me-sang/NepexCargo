import { z } from 'zod';

// User DTOs
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
});

export type AssignRoleDTO = z.infer<typeof assignRoleSchema>;

// Role DTOs
export const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid(),
});

export type AssignPermissionDTO = z.infer<typeof assignPermissionSchema>;

// Permission DTOs
export const createPermissionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
});

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(8),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
