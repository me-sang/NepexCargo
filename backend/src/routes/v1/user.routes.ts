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

export const userRoutes = Router();

// Auth routes
userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.get('/auth/me', checkPermission(), me);

// User management routes
userRoutes.get('/all', checkPermission(PermissionResource.USER_MANAGEMENT, PermissionAction.READ), getAllUsers);
userRoutes.get('/:id', checkPermission(PermissionResource.USER_MANAGEMENT, PermissionAction.READ), getUserById);
