import * as bcrypt from 'bcrypt';
import { randomInt, randomBytes, createHash } from 'crypto';
import { AppDataSource } from '@database/data-source';
import { User, Role } from '@database/entities';
import { BadRequestException, NotFoundException } from '@common/exceptions';
import { userRepository } from '@database/repositories';
import { emailProducer } from '@queues/producers/email.producer';
import { logger } from '@common/helpers/logger';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  async registerUser(email: string, password: string, firstName?: string, lastName?: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });

    if (!userRole) {
      throw new NotFoundException('Default user role');
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: [userRole],
    });

    return this.userRepository.save(user);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User');
    }

    return user;
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.roles.some((role) =>
      role.permissions?.some((perm) => perm.name === permissionName),
    );
  }

  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.roles.some((role) =>
      role.permissions?.some((perm) => permissionNames.includes(perm.name)),
    );
  }

  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    const user = await this.getUserById(userId);
    const userPermissions = new Set(
      user.roles.flatMap((role) => role.permissions?.map((p) => p.name) || []),
    );
    return permissionNames.every((name) => userPermissions.has(name));
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.getUserById(userId);
    return [...new Set(user.roles.flatMap((role) => role.permissions?.map((p) => p.name) || []))];
  }

  async forgotPassword(email: string): Promise<string> {
    const dummyToken = randomBytes(32).toString('hex');

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Forgot password requested for non-existent user or user without tenant: ${email}`);
      return dummyToken;
    }

    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const rawToken = randomBytes(32).toString('hex');
    const resetTokenHash = createHash('sha256').update(rawToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpiresAt = resetTokenExpiresAt;
    await this.userRepository.save(user);

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Password Reset</h2>
        <p>Your one-time code is:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a1a">${otp}</p>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#888;font-size:12px">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await emailProducer.send({
      to: user.email,
      subject: 'Your password reset code',
      html,
      tenantId: user.tenantId,
    });

    return rawToken;
  }

  async resetPassword(resetToken: string, otp: string, newPassword: string): Promise<void> {
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');
    const user = await userRepository.findByResetTokenHash(resetTokenHash);

    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      logger.warn(`Reset password requested with invalid or expired token`);
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await this.userRepository.save(user);
  }
}

export const userService = new UserService();
