import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '@common/dto/auth.dto';
import {
  registerUser,
  loginUser,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '@controllers/user.controller';

export const userRoutes: Router = Router();

userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.post('/auth/google', googleAuth);
userRoutes.get('/auth/me', checkPermission(), me);
userRoutes.post('/auth/verify-email', validate(verifyEmailSchema), verifyEmail);
userRoutes.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
userRoutes.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);
