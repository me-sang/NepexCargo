import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { forgotPasswordSchema, resetPasswordSchema } from '@common/dto/auth.dto';
import {
  registerUser,
  loginUser,
  me,
  forgotPassword,
  resetPassword,
} from '@controllers/user.controller';

export const userRoutes: Router = Router();

userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.get('/auth/me', checkPermission(), me);
userRoutes.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
userRoutes.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);
