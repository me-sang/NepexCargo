import { Router } from 'express';
import { checkSuperAdmin } from '@common/middlewares/super-admin-auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { loginSuperAdminSchema, createSuperAdminSchema } from '@common/dto/super-admin.dto';
import { login, me, createAdmin } from '@controllers/super-admin.controller';

export const superAdminRoutes: Router = Router();

superAdminRoutes.post('/auth/login', validate(loginSuperAdminSchema), login);
superAdminRoutes.get('/auth/me', checkSuperAdmin(), me);
superAdminRoutes.post(
  '/auth/create',
  checkSuperAdmin(),
  validate(createSuperAdminSchema),
  createAdmin,
);
