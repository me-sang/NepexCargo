import * as bcrypt from 'bcrypt';
import { AppDataSource } from '@database/data-source';
import { User, Role } from '@database/entities';
import { BadRequestException, NotFoundException } from '@common/exceptions';

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
}

export const userService = new UserService();
