import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException, ForbiddenException } from '@common/exceptions';
import { userService } from '@services';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Check if user has specific permission
 * Usage in controllers/services:
 *   await requirePermission(userId, 'create:shipments')
 */
export async function requirePermission(userId: string, permissionName: string): Promise<void> {
  const hasPermission = await userService.hasPermission(userId, permissionName);
  if (!hasPermission) {
    throw new ForbiddenException(`Permission '${permissionName}' required`);
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function requireAnyPermission(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  const hasPermission = await userService.hasAnyPermission(userId, permissionNames);
  if (!hasPermission) {
    throw new ForbiddenException(
      `One of these permissions required: ${permissionNames.join(', ')}`,
    );
  }
}

/**
 * Check if user has all specified permissions
 */
export async function requireAllPermissions(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  const hasPermission = await userService.hasAllPermissions(userId, permissionNames);
  if (!hasPermission) {
    throw new ForbiddenException(
      `All of these permissions required: ${permissionNames.join(', ')}`,
    );
  }
}

/**
 * Get user's permission list
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  return userService.getUserPermissions(userId);
}
