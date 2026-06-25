import * as bcrypt from 'bcrypt';
import { superAdminRepository } from '../repositories';
import { env } from '../../config/env.config';

export const superAdminSeeder = {
  name: '004-super-admin',
  run: async (): Promise<void> => {
    const existing = await superAdminRepository.findByEmail(env.SUPER_ADMIN_EMAIL);
    if (existing) return;

    const hashedPassword = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 10);
    const admin = superAdminRepository.create({
      email: env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
    });
    await superAdminRepository.save(admin);
  },
};
