# Super Admin Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully separate super admin auth layer (login, me, create admin) isolated from tenant user auth.

**Architecture:** `super_admins` is a standalone DB table. JWTs carry `{ sub, type: 'super_admin' }` so the `checkSuperAdmin()` middleware can reject any tenant-user token at the claim level. No public register — first admin is seeded from env, additional admins created by existing super admins via a protected endpoint.

**Tech Stack:** Express, TypeORM, PostgreSQL, JWT (`jsonwebtoken`), bcrypt, Zod, supertest (tests)

## Global Constraints

- All new files follow the existing camelCase column naming convention (TypeORM entities)
- Migration timestamp is 15-digit UTC: `260625092405110` — use this exact value
- Import aliases: `@database/`, `@common/`, `@services/`, `@controllers/`, `@config/`
- Error classes from `@common/exceptions/app.exception`
- All controllers follow the pattern: plain `async function`, `try/catch`, `next(error)` on catch
- Services are classes exported as a singleton (`export const xService = new XService()`)
- Zod + `validate()` middleware for request validation (`@common/middlewares/validate.middleware`)
- `ApiResponse` helper from `@common/helpers/api-response.helper`
- Tests live in `tests/integration/` or `tests/unit/`, filename `*.test.ts`, run with `pnpm jest`

---

### Task 1: Entity, Migration, Repository

**Files:**
- Create: `src/database/entities/super-admin.entity.ts`
- Create: `src/database/migrations/260625092405110-CreateSuperAdmins.ts`
- Create: `src/database/repositories/super-admin.repository.ts`
- Modify: `src/database/entities/index.ts`
- Modify: `src/database/repositories/index.ts`

**Interfaces:**
- Produces: `SuperAdmin` entity class, `SuperAdminStatus` enum, `superAdminRepository` with `findByEmail(email)` and `findById(id)`

- [ ] **Step 1: Create the entity**

`src/database/entities/super-admin.entity.ts`:
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SuperAdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('super_admins')
@Index(['email'], { unique: true })
export class SuperAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  /** active | inactive | suspended */
  @Column({ type: 'varchar', length: 30, default: SuperAdminStatus.ACTIVE, enum: SuperAdminStatus })
  status: SuperAdminStatus;

  @Column({ nullable: true })
  lastLoginAt: Date;

  /** Stored as varchar(45) to support both IPv4 and IPv6 addresses. */
  @Column({ length: 45, nullable: true })
  lastLoginIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create the migration**

`src/database/migrations/260625092405110-CreateSuperAdmins.ts`:
```ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSuperAdmins260625092405110 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'super_admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            // active | inactive | suspended
            name: 'status',
            type: 'varchar',
            length: '30',
            default: "'active'",
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            // varchar(45) covers both IPv4 and IPv6.
            name: 'lastLoginIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['email'], isUnique: true }),
          new TableIndex({ columnNames: ['status'] }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('super_admins');
  }
}
```

- [ ] **Step 3: Create the repository**

`src/database/repositories/super-admin.repository.ts`:
```ts
import { AppDataSource } from '../data-source';
import { SuperAdmin } from '../entities';

export const superAdminRepository = AppDataSource.getRepository(SuperAdmin).extend({
  async findByEmail(email: string): Promise<SuperAdmin | null> {
    return this.findOne({ where: { email } });
  },

  async findById(id: string): Promise<SuperAdmin | null> {
    return this.findOne({ where: { id } });
  },
});
```

- [ ] **Step 4: Update index files**

`src/database/entities/index.ts` — add at the end:
```ts
export { SuperAdmin } from './super-admin.entity';
export { SuperAdminStatus } from './super-admin.entity';
```

`src/database/repositories/index.ts` — add at the end:
```ts
export { superAdminRepository } from './super-admin.repository';
```

- [ ] **Step 5: Commit**

```bash
git add src/database/entities/super-admin.entity.ts \
        src/database/migrations/260625092405110-CreateSuperAdmins.ts \
        src/database/repositories/super-admin.repository.ts \
        src/database/entities/index.ts \
        src/database/repositories/index.ts
git commit -m "feat: add super_admins entity, migration, and repository"
```

---

### Task 2: Env Vars + Seeder

**Files:**
- Modify: `src/config/env.config.ts`
- Modify: `env.example`
- Create: `src/database/seeders/super-admin.seeder.ts`
- Modify: `src/database/seeders/index.ts`

**Interfaces:**
- Consumes: `superAdminRepository.findByEmail()`, `superAdminRepository.create()`, `superAdminRepository.save()`
- Produces: `superAdminSeeder` registered as `004-super-admin`

- [ ] **Step 1: Add env vars**

In `src/config/env.config.ts`, add inside the `cleanEnv(...)` call after `JWT_EXPIRES_IN`:
```ts
  SUPER_ADMIN_EMAIL: str(),
  SUPER_ADMIN_PASSWORD: str(),
```

- [ ] **Step 2: Document in env.example**

Add at the end of `env.example`:
```
# Super Admin (used by seeder only — never expose in client)
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=changeme123
```

- [ ] **Step 3: Create the seeder**

`src/database/seeders/super-admin.seeder.ts`:
```ts
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
```

- [ ] **Step 4: Register in seeder index**

In `src/database/seeders/index.ts`, add the import and register:
```ts
import { superAdminSeeder } from './super-admin.seeder';

const seeders = [permissionSeeder, roleSeeder, countrySeeder, superAdminSeeder];
```

- [ ] **Step 5: Commit**

```bash
git add src/config/env.config.ts \
        env.example \
        src/database/seeders/super-admin.seeder.ts \
        src/database/seeders/index.ts
git commit -m "feat: add super admin env vars and seeder"
```

---

### Task 3: DTO + Auth Middleware

**Files:**
- Create: `src/common/dto/super-admin.dto.ts`
- Create: `src/common/middlewares/super-admin-auth.middleware.ts`
- Create: `tests/unit/super-admin-auth.middleware.test.ts`

**Interfaces:**
- Consumes: `superAdminRepository.findById()`, `SuperAdminStatus`, `env.JWT_SECRET`
- Produces:
  - `loginSuperAdminSchema: ZodSchema`
  - `createSuperAdminSchema: ZodSchema`
  - `checkSuperAdmin(): RequestHandler` — attaches `req.superAdmin: SuperAdmin`

- [ ] **Step 1: Create DTOs**

`src/common/dto/super-admin.dto.ts`:
```ts
import { z } from 'zod';

export const loginSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginSuperAdminDTO = z.infer<typeof loginSuperAdminSchema>;

export const createSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateSuperAdminDTO = z.infer<typeof createSuperAdminSchema>;
```

- [ ] **Step 2: Write the failing middleware unit test**

`tests/unit/super-admin-auth.middleware.test.ts`:
```ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { checkSuperAdmin } from '../../src/common/middlewares/super-admin-auth.middleware';
import { superAdminRepository } from '../../src/database/repositories';
import { SuperAdminStatus } from '../../src/database/entities';

jest.mock('../../src/database/repositories', () => ({
  superAdminRepository: { findById: jest.fn() },
}));

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

function mockRes() {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  return res;
}

describe('checkSuperAdmin middleware', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => jest.clearAllMocks());

  it('rejects request with no token', async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    await checkSuperAdmin()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects token with wrong type claim', async () => {
    const token = jwt.sign({ sub: 'abc', type: 'user' }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    await checkSuperAdmin()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when super admin not found in DB', async () => {
    const token = jwt.sign({ sub: 'abc', type: 'super_admin' }, JWT_SECRET);
    (superAdminRepository.findById as jest.Mock).mockResolvedValue(null);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    await checkSuperAdmin()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects suspended admin', async () => {
    const token = jwt.sign({ sub: 'abc', type: 'super_admin' }, JWT_SECRET);
    (superAdminRepository.findById as jest.Mock).mockResolvedValue({ id: 'abc', status: SuperAdminStatus.SUSPENDED });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    await checkSuperAdmin()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches superAdmin to req and calls next for valid token', async () => {
    const token = jwt.sign({ sub: 'abc', type: 'super_admin' }, JWT_SECRET);
    const admin = { id: 'abc', status: SuperAdminStatus.ACTIVE };
    (superAdminRepository.findById as jest.Mock).mockResolvedValue(admin);
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = mockRes();
    await checkSuperAdmin()(req, res, next);
    expect((req as any).superAdmin).toBe(admin);
    expect(next).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run the test — confirm it fails**

```bash
cd backend && pnpm jest tests/unit/super-admin-auth.middleware.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '../../src/common/middlewares/super-admin-auth.middleware'`

- [ ] **Step 4: Create the middleware**

`src/common/middlewares/super-admin-auth.middleware.ts`:
```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';
import { superAdminRepository } from '@database/repositories';
import { SuperAdmin, SuperAdminStatus } from '@database/entities';

declare global {
  namespace Express {
    interface Request {
      superAdmin?: SuperAdmin;
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

      req.superAdmin = admin;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
};
```

- [ ] **Step 5: Run the test — confirm it passes**

```bash
cd backend && pnpm jest tests/unit/super-admin-auth.middleware.test.ts --no-coverage
```
Expected: PASS — 5 tests passing

- [ ] **Step 6: Commit**

```bash
git add src/common/dto/super-admin.dto.ts \
        src/common/middlewares/super-admin-auth.middleware.ts \
        tests/unit/super-admin-auth.middleware.test.ts
git commit -m "feat: add super admin DTOs and auth middleware"
```

---

### Task 4: Service

**Files:**
- Create: `src/services/super-admin.service.ts`
- Modify: `src/services/index.ts`
- Create: `tests/unit/super-admin.service.test.ts`

**Interfaces:**
- Consumes: `superAdminRepository.findByEmail()`, `superAdminRepository.findById()`, `superAdminRepository.create()`, `superAdminRepository.save()`, `SuperAdminStatus`, `env.JWT_SECRET`, `env.JWT_EXPIRES_IN`
- Produces: `superAdminService` with:
  - `login(email, password, ip?): Promise<{ admin, token }>`
  - `getById(id): Promise<SuperAdmin>`
  - `createAdmin(data): Promise<SuperAdmin>`

- [ ] **Step 1: Write the failing service unit tests**

`tests/unit/super-admin.service.test.ts`:
```ts
import * as bcrypt from 'bcrypt';
import { superAdminService } from '../../src/services/super-admin.service';
import { superAdminRepository } from '../../src/database/repositories';
import { SuperAdminStatus } from '../../src/database/entities';

jest.mock('../../src/database/repositories', () => ({
  superAdminRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '7d';

const activeAdmin = {
  id: 'uuid-1',
  email: 'admin@test.com',
  password: 'hashed',
  status: SuperAdminStatus.ACTIVE,
  lastLoginAt: null,
  lastLoginIp: null,
};

describe('SuperAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('throws UnauthorizedException when email not found', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(superAdminService.login('x@x.com', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue(activeAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(superAdminService.login('admin@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('throws ForbiddenException when admin is suspended', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue({ ...activeAdmin, status: SuperAdminStatus.SUSPENDED });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(superAdminService.login('admin@test.com', 'pass')).rejects.toThrow('Account is not active');
    });

    it('returns token and admin (no password) on success', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue({ ...activeAdmin });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (superAdminRepository.save as jest.Mock).mockResolvedValue(activeAdmin);
      const result = await superAdminService.login('admin@test.com', 'pass', '127.0.0.1');
      expect(result.token).toBeDefined();
      expect(result.admin).not.toHaveProperty('password');
    });
  });

  describe('getById', () => {
    it('throws NotFoundException when not found', async () => {
      (superAdminRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(superAdminService.getById('bad-id')).rejects.toThrow('not found');
    });

    it('returns admin when found', async () => {
      (superAdminRepository.findById as jest.Mock).mockResolvedValue(activeAdmin);
      const result = await superAdminService.getById('uuid-1');
      expect(result.id).toBe('uuid-1');
    });
  });

  describe('createAdmin', () => {
    it('throws ConflictException when email exists', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue(activeAdmin);
      await expect(superAdminService.createAdmin({ email: 'admin@test.com', password: 'pass12345' })).rejects.toThrow('Email already in use');
    });

    it('hashes password and saves new admin', async () => {
      (superAdminRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (superAdminRepository.create as jest.Mock).mockReturnValue({ email: 'new@test.com', password: 'hashed' });
      (superAdminRepository.save as jest.Mock).mockResolvedValue({ id: 'uuid-2', email: 'new@test.com' });
      const result = await superAdminService.createAdmin({ email: 'new@test.com', password: 'pass12345' });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass12345', 10);
      expect(result.id).toBe('uuid-2');
    });
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
cd backend && pnpm jest tests/unit/super-admin.service.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '../../src/services/super-admin.service'`

- [ ] **Step 3: Implement the service**

`src/services/super-admin.service.ts`:
```ts
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
    admin.lastLoginIp = ip ?? null;
    await superAdminRepository.save(admin);

    const token = jwt.sign(
      { sub: admin.id, type: 'super_admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
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
```

- [ ] **Step 4: Export from services index**

In `src/services/index.ts`, add:
```ts
export { superAdminService } from './super-admin.service';
```

- [ ] **Step 5: Run the test — confirm it passes**

```bash
cd backend && pnpm jest tests/unit/super-admin.service.test.ts --no-coverage
```
Expected: PASS — 7 tests passing

- [ ] **Step 6: Commit**

```bash
git add src/services/super-admin.service.ts \
        src/services/index.ts \
        tests/unit/super-admin.service.test.ts
git commit -m "feat: add super admin service"
```

---

### Task 5: Controller, Routes, Wire-up + Integration Tests

**Files:**
- Create: `src/controllers/super-admin.controller.ts`
- Create: `src/routes/v1/super-admin.routes.ts`
- Modify: `src/routes/v1/index.ts`
- Create: `tests/integration/super-admin.test.ts`

**Interfaces:**
- Consumes: `superAdminService.login()`, `superAdminService.getById()`, `superAdminService.createAdmin()`, `checkSuperAdmin()`, `validate()`, `loginSuperAdminSchema`, `createSuperAdminSchema`, `ApiResponse`
- Produces: Routes mounted at `/api/v1/admin`

- [ ] **Step 1: Write the failing integration tests**

`tests/integration/super-admin.test.ts`:
```ts
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { api, authHeader } from '../helpers/request.helper';
import { truncateTable } from '../helpers/db.helper';
import { AppDataSource } from '../../src/database/data-source';
import { SuperAdmin } from '../../src/database/entities';

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'password123';

async function seedAdmin() {
  const repo = AppDataSource.getRepository(SuperAdmin);
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return repo.save(repo.create({ email: ADMIN_EMAIL, password: hashed }));
}

function superAdminToken(id: string) {
  return jwt.sign({ sub: id, type: 'super_admin' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

function tenantUserToken(id: string) {
  return jwt.sign({ sub: id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

describe('Super Admin Auth', () => {
  beforeEach(async () => {
    await truncateTable('super_admins');
  });

  describe('POST /api/v1/admin/auth/login', () => {
    it('returns 200 and token on valid credentials', async () => {
      await seedAdmin();
      const res = await api.post('/api/v1/admin/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.admin.email).toBe(ADMIN_EMAIL);
      expect(res.body.data.admin.password).toBeUndefined();
    });

    it('returns 401 on wrong password', async () => {
      await seedAdmin();
      const res = await api.post('/api/v1/admin/auth/login').send({ email: ADMIN_EMAIL, password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('returns 401 on unknown email', async () => {
      const res = await api.post('/api/v1/admin/auth/login').send({ email: 'nobody@test.com', password: 'pass' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when body is invalid', async () => {
      const res = await api.post('/api/v1/admin/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/admin/auth/me', () => {
    it('returns 200 with admin profile for valid super admin token', async () => {
      const admin = await seedAdmin();
      const token = superAdminToken(admin.id);
      const res = await api.get('/api/v1/admin/auth/me').set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(ADMIN_EMAIL);
      expect(res.body.data.password).toBeUndefined();
    });

    it('returns 401 with no token', async () => {
      const res = await api.get('/api/v1/admin/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 when tenant user token is used', async () => {
      const token = tenantUserToken('some-user-id');
      const res = await api.get('/api/v1/admin/auth/me').set(authHeader(token));
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/admin/auth/create', () => {
    it('returns 201 and creates a new admin when called by existing admin', async () => {
      const admin = await seedAdmin();
      const token = superAdminToken(admin.id);
      const res = await api
        .post('/api/v1/admin/auth/create')
        .set(authHeader(token))
        .send({ email: 'new@test.com', password: 'newpass123', firstName: 'New' });
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('new@test.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('returns 409 when email already exists', async () => {
      const admin = await seedAdmin();
      const token = superAdminToken(admin.id);
      const res = await api
        .post('/api/v1/admin/auth/create')
        .set(authHeader(token))
        .send({ email: ADMIN_EMAIL, password: 'newpass123' });
      expect(res.status).toBe(409);
    });

    it('returns 401 with no token', async () => {
      const res = await api.post('/api/v1/admin/auth/create').send({ email: 'x@x.com', password: 'pass12345' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when password is too short', async () => {
      const admin = await seedAdmin();
      const token = superAdminToken(admin.id);
      const res = await api
        .post('/api/v1/admin/auth/create')
        .set(authHeader(token))
        .send({ email: 'x@x.com', password: 'short' });
      expect(res.status).toBe(400);
    });
  });
});
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
cd backend && pnpm jest tests/integration/super-admin.test.ts --no-coverage
```
Expected: FAIL — 404 on all endpoints (routes not mounted yet)

- [ ] **Step 3: Create the controller**

`src/controllers/super-admin.controller.ts`:
```ts
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
    const { email, password } = req.body;
    const ip = req.ip ?? req.socket?.remoteAddress;
    const result = await superAdminService.login(email, password, ip);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await superAdminService.getById(req.superAdmin!.id);
    const { password: _, ...adminData } = admin;
    ApiResponse.success(res, adminData);
  } catch (error) {
    next(error);
  }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await superAdminService.createAdmin(req.body);
    const { password: _, ...adminData } = admin;
    ApiResponse.created(res, adminData);
  } catch (error) {
    next(error);
  }
}
```

- [ ] **Step 4: Create the routes**

`src/routes/v1/super-admin.routes.ts`:
```ts
import { Router } from 'express';
import { checkSuperAdmin } from '@common/middlewares/super-admin-auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { loginSuperAdminSchema, createSuperAdminSchema } from '@common/dto/super-admin.dto';
import { login, me, createAdmin } from '@controllers/super-admin.controller';

export const superAdminRoutes: Router = Router();

superAdminRoutes.post('/auth/login', validate(loginSuperAdminSchema), login);
superAdminRoutes.get('/auth/me', checkSuperAdmin(), me);
superAdminRoutes.post('/auth/create', checkSuperAdmin(), validate(createSuperAdminSchema), createAdmin);
```

- [ ] **Step 5: Mount routes in v1 index**

Replace the contents of `src/routes/v1/index.ts`:
```ts
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { superAdminRoutes } from './super-admin.routes';

export const v1Router: ExpressRouter = Router();

v1Router.use('/admin', superAdminRoutes);
```

- [ ] **Step 6: Run the integration tests — confirm they pass**

```bash
cd backend && pnpm jest tests/integration/super-admin.test.ts --no-coverage
```
Expected: PASS — 10 tests passing

- [ ] **Step 7: Run all tests to check for regressions**

```bash
cd backend && pnpm jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/controllers/super-admin.controller.ts \
        src/routes/v1/super-admin.routes.ts \
        src/routes/v1/index.ts \
        tests/integration/super-admin.test.ts
git commit -m "feat: add super admin controller, routes, and integration tests"
```
