import { z } from 'zod';
import { registry } from '@config/swagger.config';
import {
  createUserSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@common/dto/auth.dto';

// ── Reuse existing DTO schemas — add openapi metadata on top ─────────────────

const RegisterUserBody = registry.register(
  'RegisterUserBody',
  createUserSchema.openapi({
    example: {
      email: 'user@example.com',
      password: 'securepass123',
      firstName: 'Jane',
      lastName: 'Smith',
    },
  }),
);

const LoginUserBody = registry.register(
  'LoginUserBody',
  loginSchema.openapi({ example: { email: 'user@example.com', password: 'securepass123' } }),
);

const VerifyEmailBody = registry.register(
  'VerifyEmailBody',
  verifyEmailSchema.openapi({ example: { token: 'a3f9c2...64b2', otp: '482910' } }),
);

const UserResponse = registry.register(
  'UserResponse',
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    isEmailVerified: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const UserWithTokenResponse = registry.register(
  'UserWithTokenResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      user: UserResponse,
      token: z.string().openapi({ example: 'eyJhbGci...' }),
    }),
  }),
);

const RegisterResponse = registry.register(
  'RegisterResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      token: z.string().openapi({ example: 'a3f9c2...64b2' }),
      scope: z.literal('verify-email'),
    }),
  }),
);

const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['User — Auth'],
  summary: 'Register a new user',
  description: 'Creates the account and sends an OTP to the user\'s email. Returns a scoped token to be used with POST /auth/verify-email.',
  request: { body: { content: { 'application/json': { schema: RegisterUserBody } } } },
  responses: {
    201: {
      description: 'User registered — use the returned token + OTP to verify email',
      content: { 'application/json': { schema: RegisterResponse } },
    },
    409: {
      description: 'Email already in use',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['User — Auth'],
  summary: 'Verify email with OTP',
  description: 'Validates the scoped token from registration and the OTP sent by email. Returns a full auth token on success.',
  request: { body: { content: { 'application/json': { schema: VerifyEmailBody } } } },
  responses: {
    200: {
      description: 'Email verified — returns user + auth token',
      content: { 'application/json': { schema: UserWithTokenResponse } },
    },
    400: {
      description: 'Invalid or expired token / OTP',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['User — Auth'],
  summary: 'Login a user',
  request: { body: { content: { 'application/json': { schema: LoginUserBody } } } },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: UserWithTokenResponse } },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['User — Auth'],
  summary: 'Get the currently authenticated user',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile',
      content: { 'application/json': { schema: SuccessData(UserResponse) } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// ── Password Reset Schemas ────────────────────────────────────────────────────

const ForgotPasswordBody = registry.register(
  'ForgotPasswordBody',
  forgotPasswordSchema.openapi({ example: { email: 'user@example.com' } }),
);

const ResetPasswordBody = registry.register(
  'ResetPasswordBody',
  resetPasswordSchema.openapi({
    example: { resetToken: 'a3f9c2...64b2', otp: '482910', newPassword: 'newpass123' },
  }),
);

const ForgotPasswordResponse = registry.register(
  'ForgotPasswordResponse',
  z.object({
    success: z.literal(true),
    data: z.object({ resetToken: z.string().openapi({ example: 'a3f9c2...64b2' }) }),
  }),
);

const ResetPasswordResponse = registry.register(
  'ResetPasswordResponse',
  z.object({
    success: z.literal(true),
    data: z.object({ message: z.string().openapi({ example: 'Password reset successfully' }) }),
  }),
);

// ── Password Reset Paths ──────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['User — Auth'],
  summary: 'Request a password reset OTP',
  request: { body: { content: { 'application/json': { schema: ForgotPasswordBody } } } },
  responses: {
    200: {
      description: 'Reset token returned (always 200 to prevent enumeration)',
      content: { 'application/json': { schema: ForgotPasswordResponse } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['User — Auth'],
  summary: 'Reset password using OTP and reset token',
  request: { body: { content: { 'application/json': { schema: ResetPasswordBody } } } },
  responses: {
    200: {
      description: 'Password reset successfully',
      content: { 'application/json': { schema: ResetPasswordResponse } },
    },
    400: {
      description: 'Invalid or expired reset token / OTP',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});
