import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockBaseRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

jest.mock('@database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockBaseRepo),
  },
}));

const mockUserRepo = {
  findByEmail: jest.fn(),
  findByResetTokenHash: jest.fn(),
};

jest.mock('@database/repositories', () => ({
  userRepository: mockUserRepo,
  roleRepository: {},
  permissionRepository: {},
  tenantRepository: {},
  planRepository: {},
  planFeatureRepository: {},
  tenantPlanRepository: {},
  tenantSettingRepository: {},
  tenantDomainRepository: {},
  tenantConfigurationRepository: {},
  tenantUsageRepository: {},
  countryRepository: {},
  superAdminRepository: {},
}));

const mockEmailProducer = { send: jest.fn() };
jest.mock('@queues/producers/email.producer', () => ({
  emailProducer: mockEmailProducer,
}));

// Import after mocks are set up
import { UserService } from '@services/user.service';

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService.forgotPassword', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it('returns a 64-char hex token and sends no email when user not found', async () => {
    mockBaseRepo.findOne.mockResolvedValue(null);

    const token = await service.forgotPassword('unknown@test.com');

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(mockEmailProducer.send).not.toHaveBeenCalled();
  });

  it('returns a 64-char hex token and sends no email when user has no tenantId', async () => {
    mockBaseRepo.findOne.mockResolvedValue({ email: 'u@t.com', tenantId: null });

    const token = await service.forgotPassword('u@t.com');

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(mockEmailProducer.send).not.toHaveBeenCalled();
  });

  it('stores OTP hash + reset token hash, enqueues email, returns raw token', async () => {
    const user: Record<string, unknown> = {
      email: 'u@t.com',
      tenantId: 'tenant-uuid-1',
      otpHash: null,
      otpExpiresAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    };
    mockBaseRepo.findOne.mockResolvedValue(user);
    mockBaseRepo.save.mockResolvedValue(user);
    bcryptMock.hash.mockResolvedValue('hashed-otp' as never);

    const token = await service.forgotPassword('u@t.com');

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(bcryptMock.hash).toHaveBeenCalledTimes(1);
    expect(user.otpHash).toBe('hashed-otp');
    expect(user.otpExpiresAt).toBeInstanceOf(Date);
    expect(user.resetTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(user.resetTokenExpiresAt).toBeInstanceOf(Date);
    expect(mockEmailProducer.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'u@t.com', tenantId: 'tenant-uuid-1' }),
    );
  });
});

describe('UserService.resetPassword', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it('throws when no user matches the reset token hash', async () => {
    mockUserRepo.findByResetTokenHash.mockResolvedValue(null);

    await expect(service.resetPassword('bad-token', '123456', 'newpass123')).rejects.toThrow(
      'Invalid or expired reset token',
    );
  });

  it('throws when reset token is expired', async () => {
    mockUserRepo.findByResetTokenHash.mockResolvedValue({
      resetTokenExpiresAt: new Date(Date.now() - 1000),
      otpHash: 'hash',
      otpExpiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.resetPassword('token', '123456', 'newpass123')).rejects.toThrow(
      'Invalid or expired reset token',
    );
  });

  it('throws when OTP is expired', async () => {
    mockUserRepo.findByResetTokenHash.mockResolvedValue({
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
      otpHash: 'hash',
      otpExpiresAt: new Date(Date.now() - 1000),
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    await expect(service.resetPassword('token', '123456', 'newpass123')).rejects.toThrow(
      'Invalid or expired reset token',
    );
  });

  it('throws when OTP does not match', async () => {
    mockUserRepo.findByResetTokenHash.mockResolvedValue({
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
      otpHash: 'hash',
      otpExpiresAt: new Date(Date.now() + 60_000),
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    await expect(service.resetPassword('token', 'wrong-otp', 'newpass123')).rejects.toThrow(
      'Invalid or expired reset token',
    );
  });

  it('updates password and clears reset fields on success', async () => {
    const user: Record<string, unknown> = {
      password: 'old-hash',
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
      otpHash: 'stored-otp-hash',
      otpExpiresAt: new Date(Date.now() + 60_000),
      resetTokenHash: 'stored-reset-hash',
    };
    mockUserRepo.findByResetTokenHash.mockResolvedValue(user);
    mockBaseRepo.save.mockResolvedValue(user);
    bcryptMock.compare.mockResolvedValue(true as never);
    bcryptMock.hash.mockResolvedValue('new-hashed-password' as never);

    await service.resetPassword('valid-token', '482910', 'newpass123');

    expect(bcryptMock.hash).toHaveBeenCalledWith('newpass123', 10);
    expect(user.password).toBe('new-hashed-password');
    expect(user.otpHash).toBeNull();
    expect(user.otpExpiresAt).toBeNull();
    expect(user.resetTokenHash).toBeNull();
    expect(user.resetTokenExpiresAt).toBeNull();
    expect(mockBaseRepo.save).toHaveBeenCalledWith(user);
  });
});
