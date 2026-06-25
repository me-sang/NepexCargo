/**
 * Super Admin Controller — Auth only (Phase 1)
 *
 * TODO: Future capabilities to implement here:
 *   - Tenant management: create, view, update, suspend tenants (GET/POST/PATCH /tenants)
 *   - Plan management: create and manage subscription plans (GET/POST/PATCH /plans)
 *   - User oversight: view users across all tenants (GET /users)
 *   - Platform settings: manage global configs — countries, currencies (GET/PATCH /settings)
 */

import { Request, Response, NextFunction } from 'express';
import { superAdminService } from '@services/super-admin.service';
import { ApiResponse } from '@common/helpers/api-response.helper';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const ip = req.ip ?? req.socket?.remoteAddress;
    const result = await superAdminService.login(email, password, ip);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await superAdminService.getById(req.su!.id);
    const { password: _, ...adminData } = admin;
    ApiResponse.success(res, adminData);
  } catch (error) {
    next(error);
  }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await superAdminService.createAdmin(
      req.body as { email: string; password: string; firstName?: string; lastName?: string },
    );
    const { password: _, ...adminData } = admin;
    ApiResponse.created(res, adminData);
  } catch (error) {
    next(error);
  }
}
