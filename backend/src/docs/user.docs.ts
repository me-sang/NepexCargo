import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { createUserSchema, loginSchema } from '@common/dto/auth.dto';

// ── Reuse existing DTO schemas — add openapi metadata on top ─────────────────

const RegisterUserBody = registry.register(
  'RegisterUserBody',
  createUserSchema.openapi({
    example: { email: 'user@example.com', password: 'securepass123', firstName: 'Jane', lastName: 'Smith' },
  }),
);

const LoginUserBody = registry.register(
  'LoginUserBody',
  loginSchema.openapi({ example: { email: 'user@example.com', password: 'securepass123' } }),
);

const UserResponse = registry.register(
  'UserResponse',
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
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

const SuccessData = (dataSchema: z.ZodTypeAny) => z.object({ success: z.literal(true), data: dataSchema });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['User — Auth'],
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: RegisterUserBody } } } },
  responses: {
    201: { description: 'User registered', content: { 'application/json': { schema: UserWithTokenResponse } } },
    409: { description: 'Email already in use', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['User — Auth'],
  summary: 'Login a user',
  request: { body: { content: { 'application/json': { schema: LoginUserBody } } } },
  responses: {
    200: { description: 'Login successful', content: { 'application/json': { schema: UserWithTokenResponse } } },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['User — Auth'],
  summary: 'Get the currently authenticated user',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Current user profile', content: { 'application/json': { schema: SuccessData(UserResponse) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
