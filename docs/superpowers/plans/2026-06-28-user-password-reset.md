# User Password Reset via OTP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add forgot-password and reset-password endpoints that email the user a 6-digit OTP and return a reset token to the client; both are required together to set a new password.

**Architecture:** OTP and reset token are stored (hashed) as new columns on the `users` table. Email is sent through the BullMQ email queue; the consumer fetches the tenant's email config from `TenantConfiguration`, builds a `ResendEmailClient` or `SmtpEmailClient`, and sends. The email integration follows the same client-injection pattern as Stripe/FedEx.

**Tech Stack:** TypeScript · Express · TypeORM · PostgreSQL · BullMQ · `resend` SDK · `nodemailer` · `bcrypt` · Node `crypto`

## Global Constraints

- Follow the layering rule: Routes → Controllers → Services → Repositories. No `req`/`res` in services.
- Use path aliases (`@config/*`, `@common/*`, `@services/*`, `@database/*`, `@integrations/*`, `@queues/*`) — never long relative paths.
- All env vars must go through `src/config/env.config.ts`; read via `env.*`, never `process.env` directly.
- Schema changes only via TypeORM migrations (`synchronize` is off). Never edit an applied migration.
- New route groups must be mounted in `src/routes/v1/index.ts`.
- Any route/request/response change must be reflected in `src/docs/user.docs.ts` in the same commit.
- Before committing: `pnpm format:write && pnpm lint:fix && pnpm typecheck`.
- Tests live in `tests/unit/` and run with `pnpm test:unit`.

---

## File Map

### New files
| Path | Responsibility |
|------|---------------|
| `src/integrations/email/email.types.ts` | `EmailConfig` and `EmailMessage` interfaces |
| `src/integrations/email/email.client.ts` | `EmailClient` interface, `ResendEmailClient`, `SmtpEmailClient`, `createEmailClient` factory |
| `src/integrations/email/email.service.ts` | `EmailService` — wraps client, exposes `send()` |
| `src/integrations/email/index.ts` | Re-exports all email integration symbols |
| `src/database/migrations/260628120000001-AddTenantAndPasswordResetToUsers.ts` | Adds 5 nullable columns to `users` |
| `tests/unit/integrations/email.client.test.ts` | Unit tests for `createEmailClient` factory |
| `tests/unit/services/user.password-reset.test.ts` | Unit tests for `forgotPassword` and `resetPassword` |

### Modified files
| Path | Change |
|------|--------|
| `src/common/enums/tenant.enums.ts` | Add `RESEND = 'Resend'` and `SMTP = 'SMTP'` to `TenantConfigProvider` |
| `src/database/entities/user.entity.ts` | Add `tenantId`, `otpHash`, `otpExpiresAt`, `resetTokenHash`, `resetTokenExpiresAt` columns |
| `src/database/repositories/user.repository.ts` | Add `findByResetTokenHash(hash)` method |
| `src/services/user.service.ts` | Add `forgotPassword()` and `resetPassword()` methods |
| `src/controllers/user.controller.ts` | Add `forgotPassword` and `resetPassword` handlers |
| `src/routes/v1/user.routes.ts` | Mount two new POST routes |
| `src/common/dto/auth.dto.ts` | Add `forgotPasswordSchema` and `resetPasswordSchema` |
| `src/queues/producers/email.producer.ts` | Replace `templateId`/`variables` with `subject`, `html`, `tenantId` |
| `src/queues/consumers/email.consumer.ts` | Implement actual send logic via tenant config |
| `src/integrations/index.ts` | Re-export email integration |
| `src/docs/user.docs.ts` | Add Swagger for two new endpoints |

---

## Task 1: Install dependencies + add enum values

**Files:**
- Modify: `package.json` (via pnpm)
- Modify: `src/common/enums/tenant.enums.ts`

**Interfaces:**
- Produces: `TenantConfigProvider.RESEND` and `TenantConfigProvider.SMTP` used in all later tasks

- [ ] **Step 1: Install runtime dependencies**

```bash
cd backend
pnpm add resend nodemailer
pnpm add -D @types/nodemailer
```

Expected: packages appear in `package.json` dependencies.

- [ ] **Step 2: Add RESEND and SMTP to TenantConfigProvider enum**

Open `src/common/enums/tenant.enums.ts`. Find `TenantConfigProvider` and add two entries to the `// Email` section:

```typescript
/** External provider identifiers used in tenant configurations. */
export enum TenantConfigProvider {
  // Shipment
  DHL = 'DHL',
  FEDEX = 'FedEx',
  ARAMEX = 'Aramex',
  UPS = 'UPS',
  EMX = 'EMX',
  // Payment
  STRIPE = 'Stripe',
  PAYPAL = 'PayPal',
  // Email
  RESEND = 'Resend',
  SMTP = 'SMTP',
  SENDGRID = 'SendGrid',
  MAILGUN = 'Mailgun',
  // SMS
  TWILIO = 'Twilio',
}
```

- [ ] **Step 3: Verify typecheck passes**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/common/enums/tenant.enums.ts package.json pnpm-lock.yaml
git commit -m "feat: install resend/nodemailer and add RESEND/SMTP to TenantConfigProvider"
```

---

## Task 2: Email integration layer

**Files:**
- Create: `src/integrations/email/email.types.ts`
- Create: `src/integrations/email/email.client.ts`
- Create: `src/integrations/email/email.service.ts`
- Create: `src/integrations/email/index.ts`
- Modify: `src/integrations/index.ts`
- Create: `tests/unit/integrations/email.client.test.ts`

**Interfaces:**
- Consumes: `TenantConfigProvider.RESEND`, `TenantConfigProvider.SMTP` (Task 1)
- Produces:
  - `EmailConfig { provider: TenantConfigProvider; credentials: Record<string, unknown> }`
  - `EmailMessage { to: string; subject: string; html: string; fromEmail: string; fromName: string }`
  - `interface EmailClient { send(message: EmailMessage): Promise<void> }`
  - `class ResendEmailClient implements EmailClient`
  - `class SmtpEmailClient implements EmailClient`
  - `function createEmailClient(config: EmailConfig): EmailClient`
  - `class EmailService { send(message: EmailMessage): Promise<void> }`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/integrations/email.client.test.ts`:

```typescript
import { createEmailClient, ResendEmailClient, SmtpEmailClient } from '@integrations/email';
import { EmailService } from '@integrations/email';
import { TenantConfigProvider } from '@common/enums/tenant.enums';

describe('createEmailClient', () => {
  it('returns ResendEmailClient for RESEND provider', () => {
    const client = createEmailClient({
      provider: TenantConfigProvider.RESEND,
      credentials: { apiKey: 're_test_key', fromEmail: 'n@e.com', fromName: 'App' },
    });
    expect(client).toBeInstanceOf(ResendEmailClient);
  });

  it('returns SmtpEmailClient for SMTP provider', () => {
    const client = createEmailClient({
      provider: TenantConfigProvider.SMTP,
      credentials: { host: 'smtp.test.com', port: 587, secure: false, user: 'u', password: 'p', fromEmail: 'n@e.com', fromName: 'App' },
    });
    expect(client).toBeInstanceOf(SmtpEmailClient);
  });

  it('throws for unsupported provider', () => {
    expect(() =>
      createEmailClient({ provider: 'unknown' as TenantConfigProvider, credentials: {} }),
    ).toThrow('Unsupported email provider: unknown');
  });
});

describe('EmailService.send', () => {
  it('delegates to client.send with the full message', async () => {
    const mockClient = { send: jest.fn().mockResolvedValue(undefined) };
    const service = new EmailService(mockClient);

    const msg = {
      to: 'user@test.com',
      subject: 'Test',
      html: '<p>hi</p>',
      fromEmail: 'no-reply@app.com',
      fromName: 'App',
    };
    await service.send(msg);

    expect(mockClient.send).toHaveBeenCalledTimes(1);
    expect(mockClient.send).toHaveBeenCalledWith(msg);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test:unit -- --testPathPattern=email.client
```

Expected: `Cannot find module '@integrations/email'`.

- [ ] **Step 3: Create email.types.ts**

```typescript
// src/integrations/email/email.types.ts
import { TenantConfigProvider } from '@common/enums/tenant.enums';

export interface EmailConfig {
  provider: TenantConfigProvider;
  credentials: Record<string, unknown>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
}
```

- [ ] **Step 4: Create email.client.ts**

```typescript
// src/integrations/email/email.client.ts
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { TenantConfigProvider } from '@common/enums/tenant.enums';
import { EmailConfig, EmailMessage } from './email.types';

export interface EmailClient {
  send(message: EmailMessage): Promise<void>;
}

export class ResendEmailClient implements EmailClient {
  private readonly sdk: Resend;

  constructor(config: EmailConfig) {
    const creds = config.credentials as { apiKey: string };
    this.sdk = new Resend(creds.apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    await this.sdk.emails.send({
      from: `${message.fromName} <${message.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}

export class SmtpEmailClient implements EmailClient {
  constructor(private readonly config: EmailConfig) {}

  async send(message: EmailMessage): Promise<void> {
    const creds = this.config.credentials as {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };

    const transporter = nodemailer.createTransport({
      host: creds.host,
      port: creds.port,
      secure: creds.secure,
      auth: { user: creds.user, pass: creds.password },
    });

    await transporter.sendMail({
      from: `"${message.fromName}" <${message.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}

export function createEmailClient(config: EmailConfig): EmailClient {
  switch (config.provider) {
    case TenantConfigProvider.RESEND:
      return new ResendEmailClient(config);
    case TenantConfigProvider.SMTP:
      return new SmtpEmailClient(config);
    default:
      throw new Error(`Unsupported email provider: ${config.provider}`);
  }
}
```

- [ ] **Step 5: Create email.service.ts**

```typescript
// src/integrations/email/email.service.ts
import { EmailClient } from './email.client';
import { EmailMessage } from './email.types';

export class EmailService {
  constructor(private readonly client: EmailClient) {}

  async send(message: EmailMessage): Promise<void> {
    await this.client.send(message);
  }
}
```

- [ ] **Step 6: Create index.ts**

```typescript
// src/integrations/email/index.ts
export type { EmailConfig, EmailMessage } from './email.types';
export type { EmailClient } from './email.client';
export { ResendEmailClient, SmtpEmailClient, createEmailClient } from './email.client';
export { EmailService } from './email.service';
```

- [ ] **Step 7: Re-export from integrations/index.ts**

Add to the bottom of `src/integrations/index.ts`:

```typescript
export * from './email';
```

- [ ] **Step 8: Run tests — expect pass**

```bash
pnpm test:unit -- --testPathPattern=email.client
```

Expected: 4 tests pass.

- [ ] **Step 9: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/integrations/email/ src/integrations/index.ts tests/unit/integrations/email.client.test.ts
git commit -m "feat: add email integration layer with Resend and SMTP drivers"
```

---

## Task 3: User entity + migration

**Files:**
- Modify: `src/database/entities/user.entity.ts`
- Create: `src/database/migrations/260628120000001-AddTenantAndPasswordResetToUsers.ts`

**Interfaces:**
- Consumes: `Tenant` entity (already exists at `src/database/entities/tenant.entity.ts`)
- Produces: `User` entity with `tenantId`, `otpHash`, `otpExpiresAt`, `resetTokenHash`, `resetTokenExpiresAt`

- [ ] **Step 1: Add columns to User entity**

Replace the entire content of `src/database/entities/user.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Tenant } from './tenant.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status'])
@Index(['resetTokenHash'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'blocked';

  @Column({ nullable: true })
  lastLoginAt: Date;

  // ── Tenant ──────────────────────────────────────────────────────────────────

  @Column({ type: 'uuid', nullable: true })
  tenantId: string | null;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant | null;

  // ── Password reset ───────────────────────────────────────────────────────────

  @Column({ nullable: true })
  otpHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ nullable: true })
  resetTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiresAt: Date | null;

  // ── Roles ────────────────────────────────────────────────────────────────────

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create the migration file**

Create `src/database/migrations/260628120000001-AddTenantAndPasswordResetToUsers.ts`:

```typescript
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddTenantAndPasswordResetToUsers260628120000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'tenantId', type: 'uuid', isNullable: true }),
      new TableColumn({ name: 'otpHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'otpExpiresAt', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'resetTokenHash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'resetTokenExpiresAt', type: 'timestamp', isNullable: true }),
    ]);

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_resetTokenHash', columnNames: ['resetTokenHash'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');

    const fk = table!.foreignKeys.find((f) => f.columnNames.includes('tenantId'));
    if (fk) await queryRunner.dropForeignKey('users', fk);

    await queryRunner.dropIndex('users', 'IDX_users_resetTokenHash');

    await queryRunner.dropColumns('users', [
      'tenantId',
      'otpHash',
      'otpExpiresAt',
      'resetTokenHash',
      'resetTokenExpiresAt',
    ]);
  }
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Run the migration against your local DB**

```bash
pnpm migration:run
```

Expected: `query: ALTER TABLE "users" ADD "tenantId" uuid` (and 4 more columns).

- [ ] **Step 5: Commit**

```bash
git add src/database/entities/user.entity.ts src/database/migrations/260628120000001-AddTenantAndPasswordResetToUsers.ts
git commit -m "feat: add tenantId and password-reset columns to users entity and migration"
```

---

## Task 4: User repository + service (forgotPassword + resetPassword)

**Files:**
- Modify: `src/database/repositories/user.repository.ts`
- Modify: `src/services/user.service.ts`
- Create: `tests/unit/services/user.password-reset.test.ts`

**Interfaces:**
- Consumes:
  - `User` entity with `tenantId`, `otpHash`, `otpExpiresAt`, `resetTokenHash`, `resetTokenExpiresAt` (Task 3)
  - `emailProducer.send(data: EmailJobData): Promise<void>` — existing, not yet updated (uses old shape; Task 5 updates it — write the call with the new shape here and update the producer interface in Task 5)
- Produces:
  - `userRepository.findByResetTokenHash(hash: string): Promise<User | null>`
  - `userService.forgotPassword(email: string): Promise<string>` — returns raw reset token
  - `userService.resetPassword(resetToken: string, otp: string, newPassword: string): Promise<void>`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/services/user.password-reset.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test:unit -- --testPathPattern=user.password-reset
```

Expected: `TypeError: service.forgotPassword is not a function`.

- [ ] **Step 3: Add findByResetTokenHash to user repository**

In `src/database/repositories/user.repository.ts`, add inside the `.extend({})` block:

```typescript
async findByResetTokenHash(resetTokenHash: string): Promise<User | null> {
  return this.findOne({ where: { resetTokenHash } });
},
```

Full file after edit:

```typescript
import { AppDataSource } from '../data-source';
import { User } from '../entities';

export const userRepository = AppDataSource.getRepository(User).extend({
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  },

  async findWithPermissions(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  },

  async findByResetTokenHash(resetTokenHash: string): Promise<User | null> {
    return this.findOne({ where: { resetTokenHash } });
  },
});
```

- [ ] **Step 4: Add forgotPassword and resetPassword to UserService**

Add the following imports to the top of `src/services/user.service.ts`:

```typescript
import { randomInt, randomBytes, createHash } from 'crypto';
import { userRepository } from '@database/repositories';
import { emailProducer } from '@queues/producers/email.producer';
import { BadRequestException } from '@common/exceptions';
```

Then add these two methods to the `UserService` class (before the closing `}`):

```typescript
async forgotPassword(email: string): Promise<string> {
  const dummyToken = randomBytes(32).toString('hex');

  const user = await this.userRepository.findOne({ where: { email } });
  if (!user || !user.tenantId) {
    return dummyToken;
  }

  const otp = String(randomInt(100000, 999999));
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
```

- [ ] **Step 5: Run tests — expect pass**

```bash
pnpm test:unit -- --testPathPattern=user.password-reset
```

Expected: 9 tests pass.

- [ ] **Step 6: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors. (The `emailProducer.send` call will have a type error until Task 5 updates the producer interface — if so, add a `// @ts-expect-error updated in next task` comment temporarily.)

- [ ] **Step 7: Commit**

```bash
git add src/database/repositories/user.repository.ts src/services/user.service.ts tests/unit/services/user.password-reset.test.ts
git commit -m "feat: add forgotPassword and resetPassword to UserService"
```

---

## Task 5: Email producer + consumer

**Files:**
- Modify: `src/queues/producers/email.producer.ts`
- Modify: `src/queues/consumers/email.consumer.ts`

**Interfaces:**
- Consumes:
  - `createEmailClient(config: EmailConfig): EmailClient` (Task 2)
  - `EmailService` (Task 2)
  - `tenantConfigurationRepository.findEnabledByType(tenantId, configType)` (existing)
  - `TenantConfigType.EMAIL` (existing enum)
  - `TenantConfigProvider` (Task 1)
- Produces: `emailProducer.send({ to, subject, html, tenantId })` — final shape

- [ ] **Step 1: Update EmailJobData in email.producer.ts**

Replace the entire file `src/queues/producers/email.producer.ts`:

```typescript
import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '@config/queue.config';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  tenantId: string;
}

export const emailProducer = {
  async send(data: EmailJobData) {
    return getQueue(QUEUE_NAMES.EMAIL).add('send', data);
  },
};
```

- [ ] **Step 2: Implement email consumer**

Replace the entire file `src/queues/consumers/email.consumer.ts`:

```typescript
import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '@config/queue.config';
import { EmailJobData } from '../producers/email.producer';
import { logger } from '@common/helpers/logger';
import { tenantConfigurationRepository } from '@database/repositories';
import { TenantConfigType, TenantConfigProvider } from '@common/enums/tenant.enums';
import { createEmailClient, EmailService } from '@integrations/email';

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html, tenantId } = job.data;

  const configs = await tenantConfigurationRepository.findEnabledByType(
    tenantId,
    TenantConfigType.EMAIL,
  );

  if (!configs.length) {
    logger.error(`No email configuration found for tenant ${tenantId}`);
    throw new Error(`No email configuration for tenant ${tenantId}`);
  }

  const [config] = configs;
  const creds = config.credentials as { fromEmail: string; fromName: string };

  const client = createEmailClient({
    provider: config.provider as TenantConfigProvider,
    credentials: config.credentials,
  });

  const emailService = new EmailService(client);

  await emailService.send({
    to,
    subject,
    html,
    fromEmail: creds.fromEmail,
    fromName: creds.fromName,
  });
}

export function startEmailWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, defaultQueueConfig);
  worker.on('failed', (job, err) => logger.error(`Email job failed: ${job?.id}`, err));
  worker.on('completed', (job) => logger.info(`Email job completed: ${job.id}`));
  return worker;
}
```

- [ ] **Step 3: Remove the temporary @ts-expect-error comment from user.service.ts (if added in Task 4 Step 6)**

The producer now has the correct `EmailJobData` shape, so the type error is resolved.

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/queues/producers/email.producer.ts src/queues/consumers/email.consumer.ts
git commit -m "feat: implement email consumer with tenant config resolution and update EmailJobData shape"
```

---

## Task 6: DTOs + controller + routes + Swagger docs

**Files:**
- Modify: `src/common/dto/auth.dto.ts`
- Modify: `src/controllers/user.controller.ts`
- Modify: `src/routes/v1/user.routes.ts`
- Modify: `src/docs/user.docs.ts`

**Interfaces:**
- Consumes:
  - `userService.forgotPassword(email: string): Promise<string>` (Task 4)
  - `userService.resetPassword(resetToken: string, otp: string, newPassword: string): Promise<void>` (Task 4)
- Produces: `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password`

- [ ] **Step 1: Add DTOs to auth.dto.ts**

Add to the bottom of `src/common/dto/auth.dto.ts`:

```typescript
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(8),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
```

- [ ] **Step 2: Add handlers to user.controller.ts**

Add the following two functions to `src/controllers/user.controller.ts`:

```typescript
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    const resetToken = await userService.forgotPassword(email);
    ApiResponse.success(res, { resetToken });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resetToken, otp, newPassword } = req.body as {
      resetToken: string;
      otp: string;
      newPassword: string;
    };
    await userService.resetPassword(resetToken, otp, newPassword);
    ApiResponse.success(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}
```

- [ ] **Step 3: Mount routes in user.routes.ts**

Replace `src/routes/v1/user.routes.ts` with:

```typescript
import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { forgotPasswordSchema, resetPasswordSchema } from '@common/dto/auth.dto';
import { registerUser, loginUser, me, forgotPassword, resetPassword } from '@controllers/user.controller';

export const userRoutes: Router = Router();

userRoutes.post('/auth/register', registerUser);
userRoutes.post('/auth/login', loginUser);
userRoutes.get('/auth/me', checkPermission(), me);
userRoutes.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
userRoutes.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);
```

- [ ] **Step 4: Mount userRoutes in v1 router**

Open `src/routes/v1/index.ts`. The `userRoutes` must be mounted — check if it already is. If not, add:

```typescript
import { userRoutes } from './user.routes';

// add inside v1Router setup:
v1Router.use('/', userRoutes);
```

If it's already mounted, skip this step.

- [ ] **Step 5: Update Swagger docs in src/docs/user.docs.ts**

Add the following imports at the top of `src/docs/user.docs.ts` (after existing imports):

```typescript
import { forgotPasswordSchema, resetPasswordSchema } from '@common/dto/auth.dto';
```

Then add the two new schemas and paths at the bottom of `src/docs/user.docs.ts`:

```typescript
// ── Password Reset Schemas ────────────────────────────────────────────────────

const ForgotPasswordBody = registry.register(
  'ForgotPasswordBody',
  forgotPasswordSchema.openapi({ example: { email: 'user@example.com' } }),
);

const ResetPasswordBody = registry.register(
  'ResetPasswordBody',
  resetPasswordSchema.openapi({
    example: { resetToken: 'a3f9c2...64b2', otp: '482910', newPassword: 'newpass123' },
  }),
);

const ForgotPasswordResponse = registry.register(
  'ForgotPasswordResponse',
  z.object({
    success: z.literal(true),
    data: z.object({ resetToken: z.string().openapi({ example: 'a3f9c2...64b2' }) }),
  }),
);

const ResetPasswordResponse = registry.register(
  'ResetPasswordResponse',
  z.object({
    success: z.literal(true),
    data: z.object({ message: z.string().openapi({ example: 'Password reset successfully' }) }),
  }),
);

// ── Password Reset Paths ──────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['User — Auth'],
  summary: 'Request a password reset OTP',
  request: { body: { content: { 'application/json': { schema: ForgotPasswordBody } } } },
  responses: {
    200: {
      description: 'Reset token returned (always 200 to prevent enumeration)',
      content: { 'application/json': { schema: ForgotPasswordResponse } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['User — Auth'],
  summary: 'Reset password using OTP and reset token',
  request: { body: { content: { 'application/json': { schema: ResetPasswordBody } } } },
  responses: {
    200: {
      description: 'Password reset successfully',
      content: { 'application/json': { schema: ResetPasswordResponse } },
    },
    400: {
      description: 'Invalid or expired reset token / OTP',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});
```

Note: `ErrorResponse` is already defined earlier in `user.docs.ts`. Do not redefine it.

- [ ] **Step 6: Run all unit tests**

```bash
pnpm test:unit
```

Expected: all tests pass.

- [ ] **Step 7: Typecheck + lint**

```bash
pnpm typecheck && pnpm lint:fix && pnpm format:write
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/common/dto/auth.dto.ts src/controllers/user.controller.ts src/routes/v1/user.routes.ts src/routes/v1/index.ts src/docs/user.docs.ts
git commit -m "feat: add forgot-password and reset-password endpoints with Swagger docs"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `tenantId` nullable FK on users — Task 3
- ✅ `otpHash`, `otpExpiresAt`, `resetTokenHash`, `resetTokenExpiresAt` — Task 3
- ✅ `RESEND` + `SMTP` enum values — Task 1
- ✅ Resend and SMTP credential shapes supported — Task 2
- ✅ `POST /auth/forgot-password` returns dummy token for unknown email / no tenantId — Task 4
- ✅ OTP = `crypto.randomInt(100000, 999999)`, bcrypt-hashed — Task 4
- ✅ Reset token = 32-byte hex, SHA-256-hashed in DB — Task 4
- ✅ Both expire in 10 minutes — Task 4
- ✅ `POST /auth/reset-password` validates token hash + OTP + expiry, clears fields — Task 4
- ✅ All error messages use same generic string — Task 4
- ✅ Consumer fetches tenant config, builds client, sends — Task 5
- ✅ No email config → job fails (no retry) — Task 5
- ✅ Swagger updated — Task 6
- ✅ `newPassword` min 8 chars in DTO — Task 6

**Placeholder scan:** No TBDs or TODOs. All steps have actual code.

**Type consistency:** `EmailJobData` shape (`to`, `subject`, `html`, `tenantId`) used consistently in Task 4 (service call) and Task 5 (producer definition). `forgotPassword` returns `string` used in Task 6 controller. `resetPassword` returns `void` used in Task 6 controller.
