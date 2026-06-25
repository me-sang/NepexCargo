import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { superAdminRepository } from '@database/repositories';
import { SuperAdmin, SuperAdminStatus } from '@database/entities';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      su?: SuperAdmin;
    }
  }
}

export const checkSuperAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; type: string };

      if (decoded.type !== 'super_admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const admin = await superAdminRepository.findById(decoded.sub);
      if (!admin || admin.status !== SuperAdminStatus.ACTIVE) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      req.su = admin;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
};
