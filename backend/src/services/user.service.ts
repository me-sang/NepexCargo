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
}

export const userService = new UserService();
