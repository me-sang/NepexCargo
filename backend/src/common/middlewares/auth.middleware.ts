import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { AppDataSource } from '@database/data-source';
import { User } from '@database/entities';
import { PermissionAction, PermissionResource, UserRole } from '@config/permission.enums';
import { logger } from '@common/helpers/logger';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Auth middleware with permission checking
 * Usage:
 *   - checkPermission() → only auth check
 *   - checkPermission(SHIPMENT_MANAGEMENT) → auth + resource check
 *   - checkPermission(SHIPMENT_MANAGEMENT, WRITE) → full permission check
 */
export const checkPermission = (resource?: PermissionResource, action?: PermissionAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: decoded.sub },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = user;

      // If no resource specified, just verify auth
      if (!resource || !action) {
        return next();
      }

      // Check permission
      const hasPermission = user.roles?.some((role) =>
        role.permissions?.some(
          (perm) => perm.name === resource && (perm.category === action || perm.category === 'all'),
        ),
      );

      if (!hasPermission) {
        return res.status(403).json({ success: false, message: 'Permission denied' });
      }

      logger.info(`User ${user.email} accessed ${resource}.${action}`);
      return next();
    } catch (error) {
      logger.error('Auth middleware error', error);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
};

/**
 * Role-gate middleware. Must run after checkPermission() so req.user is set.
 * Usage: checkRole([UserRole.PARTNER_OWNER, UserRole.MANAGER])
 */
export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const hasRole = user.roles?.some((r) => roles.includes(r.name as UserRole));
    if (!hasRole) {
      return res.status(403).json({ success: false, message: 'Insufficient role' });
    }

    return next();
  };
};
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const userRepository = AppDataSource.getRepository(User);

    userRepository
      .findOne({
        where: { id: decoded.sub },
        relations: ['roles', 'roles.permissions'],
      })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        return next();
      })
      .catch((error) => {
        logger.error('User auth middleware error', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } catch (error) {
    logger.error('User auth middleware error', error);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
