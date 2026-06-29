import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { loginSuperAdminSchema, createSuperAdminSchema } from '@common/dto/super-admin.dto';

// ── Reuse existing DTO schemas — add openapi metadata on top ─────────────────

const SuperAdminLoginBody = registry.register(
  'SuperAdminLoginBody',
  loginSuperAdminSchema.openapi({ example: { email: 'admin@example.com', password: 'secret123' } }),
);

const CreateSuperAdminBody = registry.register(
  'CreateSuperAdminBody',
  createSuperAdminSchema.openapi({
    example: {
      email: 'newadmin@example.com',
      password: 'securepass123',
      firstName: 'John',
      lastName: 'Doe',
    },
  }),
);

const SuperAdminResponse = registry.register(
  'SuperAdminResponse',
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const AuthTokenResponse = registry.register(
  'SuperAdminAuthTokenResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      token: z.string().openapi({ example: 'eyJhbGci...' }),
      admin: SuperAdminResponse,
    }),
  }),
);

const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/admin/auth/login',
  tags: ['Super Admin — Auth'],
  summary: 'Super admin login',
  request: { body: { content: { 'application/json': { schema: SuperAdminLoginBody } } } },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: AuthTokenResponse } },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/auth/me',
  tags: ['Super Admin — Auth'],
  summary: 'Get authenticated super admin profile',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Current super admin',
      content: { 'application/json': { schema: SuccessData(SuperAdminResponse) } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/auth/create',
  tags: ['Super Admin — Auth'],
  summary: 'Create a new super admin (requires super admin auth)',
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateSuperAdminBody } } } },
  responses: {
    201: {
      description: 'Super admin created',
      content: { 'application/json': { schema: SuccessData(SuperAdminResponse) } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponse } },
    },
    409: {
      description: 'Email already in use',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});
