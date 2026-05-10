import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { registerUser, loginUser, me } from '@controllers/user.controller';

export const userRoutes: Router = Router();

// Auth routes
userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.get('/auth/me', checkPermission(), me);
