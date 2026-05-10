import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { PermissionResource, PermissionAction } from '@config/permission.enums';
import {
  registerUser,
  loginUser,
  me,
  getUserById,
  getAllUsers,
} from '@controllers/user.controller';

export const userRoutes: Router = Router();

// Auth routes
userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.get('/auth/me', checkPermission(), me);

