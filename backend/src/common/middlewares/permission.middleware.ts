import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '@common/exceptions';
import { requirePermission, requireAnyPermission, requireAllPermissions } from '@common/helpers/permission.helper';

/**
 * Middleware factory for checking single permission
 * Usage in routes:
 *   router.post('/shipments', checkPermission('create:shipments'), controller)
 */
export function checkPermission(permissionName: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) {
      return next(new ForbiddenException('User not authenticated'));
    }
    try {
      await requirePermission(req.userId, permissionName);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware factory for checking if user has any of the permissions
 * Usage in routes:
 *   router.get('/users', checkAnyPermission(['read:users', 'admin']), controller)
 */
export function checkAnyPermission(permissionNames: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) {
      return next(new ForbiddenException('User not authenticated'));
    }
    try {
      await requireAnyPermission(req.userId, permissionNames);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware factory for checking if user has all permissions
 * Usage in routes:
 *   router.delete('/users/:id', checkAllPermissions(['delete:users', 'admin']), controller)
 */
export function checkAllPermissions(permissionNames: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) {
      return next(new ForbiddenException('User not authenticated'));
    }
    try {
      await requireAllPermissions(req.userId, permissionNames);
      next();
    } catch (error) {
      next(error);
    }
  };
}
