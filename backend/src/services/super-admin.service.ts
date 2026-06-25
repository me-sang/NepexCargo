import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { superAdminRepository } from '@database/repositories';
import { SuperAdmin, SuperAdminStatus } from '@database/entities';
import {
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@common/exceptions/app.exception';

export class SuperAdminService {
  async login(
    email: string,
    password: string,
    ip?: string,
  ): Promise<{ admin: Omit<SuperAdmin, 'password'>; token: string }> {
    const admin = await superAdminRepository.findByEmail(email);
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (admin.status !== SuperAdminStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip ?? null!;
    await superAdminRepository.save(admin);

    const token = jwt.sign(
      { sub: admin.id, type: 'super_admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    const { password: _, ...adminData } = admin;
    return { admin: adminData, token };
  }

  async getById(id: string): Promise<SuperAdmin> {
    const admin = await superAdminRepository.findById(id);
    if (!admin) throw new NotFoundException('Super admin');
    return admin;
  }

  async createAdmin(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<SuperAdmin> {
    const existing = await superAdminRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const admin = superAdminRepository.create({ ...data, password: hashedPassword });
    return superAdminRepository.save(admin);
  }
}

export const superAdminService = new SuperAdminService();
