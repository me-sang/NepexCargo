# Backend Data Model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all database entities (Zone, RateCard, WeightTier, Agent, Booking cluster, QuoteRequest) and extend existing User + TenantConfiguration entities to support the rate engine, agent system, and booking system.

**Architecture:** 7 tasks in strict order: new enum files → extend User → extend TenantConfiguration → rate engine tables → Agent table → booking cluster tables → register all in entities/index.ts. Each task writes the TypeScript entity, a reversible migration, and an integration smoke test against the real DB.

**Tech Stack:** TypeORM · PostgreSQL · TypeScript · Jest (integration, real DB via `AppDataSource`)

## Global Constraints

- All commands run from `backend/`
- UUID PKs: `{ isPrimary: true, default: 'uuid_generate_v4()' }`
- Migration timestamp: 15-digit UTC string — generate with: `node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"`
- Migration class name: `PascalCaseName<TIMESTAMP>` where `<TIMESTAMP>` is the generated value
- Never edit an already-applied migration; always create a new one
- Every `up()` must have a correct reversible `down()` (drop FKs → drop indices → drop columns/tables in reverse order)
- `synchronize: false` — all schema changes go through migrations only
- Money columns: `{ type: 'numeric', precision: 18, scale: 2 }`
- String arrays (regions, service types): `{ type: 'jsonb' }` — stored as JSON array, e.g. `["US","NP"]`
- Tests: integration only, real DB — never mock. Follow pattern in `tests/integration/super-admin.test.ts`
- Path aliases: `@database/*`, `@common/*` — never use long relative paths from within `src/`
- Run `pnpm format:write && pnpm lint:fix && pnpm typecheck` before each commit
- Test runner: `pnpm test:integration -- --testPathPattern=<filename>`

---

### Task 1: New enum files

**Files:**
- Create: `src/common/enums/rate.enums.ts`
- Create: `src/common/enums/agent.enums.ts`
- Create: `src/common/enums/booking.enums.ts`
- Modify: `src/common/enums/tenant.enums.ts` (extend `TenantConfigProvider`, add `IntegrationTestStatus`)

**Interfaces:**
- Produces: `RateCardType`, `AgentAccountType`, `AgentServiceType`, `BookingSource`, `BookingStatus`, `ProtectionType`, `BookingDocumentType`, `QuoteStatus`, `IntegrationTestStatus` — imported in Tasks 3–6

- [ ] **Step 1: Create `src/common/enums/rate.enums.ts`**

```typescript
export enum RateCardType {
  ZONE = 'zone',
  ROUTE = 'route',
  FLAT = 'flat',
}
```

- [ ] **Step 2: Create `src/common/enums/agent.enums.ts`**

```typescript
export enum AgentAccountType {
  CREDIT = 'credit',
  REGULAR = 'regular',
}

export enum AgentServiceType {
  INTERNATIONAL = 'international',
  DOMESTIC = 'domestic',
  LOCAL = 'local',
}
```

- [ ] **Step 3: Create `src/common/enums/booking.enums.ts`**

```typescript
export enum BookingSource {
  MANUAL = 'manual',
  BULK_IMPORT = 'bulk_import',
  QUOTE_REQUEST = 'quote_request',
}

export enum BookingStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum ProtectionType {
  FREE = 'free',
  OPT_OUT = 'opt_out',
  INSURED = 'insured',
}

export enum BookingDocumentType {
  AIRWAYBILL = 'airwaybill',
  COMMERCIAL_INVOICE = 'commercial_invoice',
  CUSTOMS_INVOICE = 'customs_invoice',
}

export enum QuoteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}
```

- [ ] **Step 4: Extend `src/common/enums/tenant.enums.ts`**

Replace the `TenantConfigProvider` enum (keep all existing values, append new ones) and add `IntegrationTestStatus`. The full updated file:

```typescript
/** Lifecycle state of a tenant account. */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/** Billing model used for the tenant account. */
export enum TenantAccountType {
  REGULAR = 'regular',
  CREDIT = 'credit',
}

/** Lifecycle state of a tenant's plan subscription. */
export enum TenantPlanStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

/** How the subscription renews after each billing cycle. */
export enum TenantPlanRenewalType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

/** Logical grouping for tenant settings keys. */
export enum TenantSettingCategory {
  BRANDING = 'branding',
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  NOTIFICATIONS = 'notifications',
  OTHER = 'other',
}

/** Whether a domain was assigned as a subdomain or a custom domain brought by the tenant. */
export enum TenantDomainType {
  SUBDOMAIN = 'subdomain',
  CUSTOM = 'custom',
}

/** SSL provisioning state for a tenant domain. */
export enum TenantDomainSslStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/** Category of external service a tenant configuration entry covers. */
export enum TenantConfigType {
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  EMAIL = 'email',
  SMS = 'sms',
  OTHER = 'other',
}

/** External provider identifiers used in tenant configurations. */
export enum TenantConfigProvider {
  // Shipment — international
  DHL = 'DHL',
  FEDEX = 'FedEx',
  ARAMEX = 'Aramex',
  UPS = 'UPS',
  EMX = 'EMX',
  NEPAL_POST = 'NepalPost',
  EMIRATES_POST = 'EmiratesPost',
  THAILAND_POST = 'ThailandPost',
  JAPAN_POST = 'JapanPost',
  MALAYSIA_POST = 'MalaysiaPost',
  NEPEX_CARGO = 'NepexCargo',
  // Shipment — domestic
  DTDC = 'DTDC',
  DELHIVERY = 'Delhivery',
  INDIAN_POST = 'IndianPost',
  NEPAL_CAN_MOVE = 'NepalCanMove',
  SAJHA_COURIER = 'SajhaCourier',
  UPAYA_COURIER = 'UpayaCourier',
  // Payment
  STRIPE = 'Stripe',
  PAYPAL = 'PayPal',
  CONNECTIPS = 'ConnectIPS',
  FONEPAY = 'Fonepay',
  NOONPAY = 'NoonPay',
  RAZORPAY = 'Razorpay',
  // Email
  SENDGRID = 'SendGrid',
  MAILGUN = 'Mailgun',
  // SMS
  TWILIO = 'Twilio',
}

/** Result of the last API connection test for a TenantConfiguration. */
export enum IntegrationTestStatus {
  UNTESTED = 'untested',
  SUCCESS = 'success',
  FAILED = 'failed',
}
```

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 6: Format + lint**

```bash
pnpm format:write && pnpm lint:fix
```

- [ ] **Step 7: Commit**

```bash
git add src/common/enums/rate.enums.ts src/common/enums/agent.enums.ts src/common/enums/booking.enums.ts src/common/enums/tenant.enums.ts
git commit -m "feat: add rate, agent, booking enums; extend TenantConfigProvider with all carriers and gateways"
```

---

### Task 2: Extend User entity + migration

**Files:**
- Modify: `src/database/entities/user.entity.ts`
- Create: `src/database/migrations/<TIMESTAMP>-ExtendUsersWithTenantAndPhone.ts`
- Create: `tests/integration/user-entity.test.ts`

**Interfaces:**
- Produces: `User.tenantId: string | null`, `User.phone: string | null` — consumed by Agent entity in Task 5

- [ ] **Step 1: Write the failing test**

Create `tests/integration/user-entity.test.ts`:

```typescript
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../src/database/data-source';
import { Tenant, User } from '../../src/database/entities';
import { truncateAll } from '../helpers/db.helper';

async function seedTenant() {
  const repo = AppDataSource.getRepository(Tenant);
  return repo.save(
    repo.create({ code: 'TEST-001', slug: 'test-tenant', legalName: 'Test Company Ltd' }),
  );
}

describe('User entity — tenantId + phone', () => {
  beforeEach(async () => {
    await truncateAll(['user_roles', 'users', 'tenants']);
  });

  it('saves a tenant-scoped user with phone', async () => {
    const tenant = await seedTenant();
    const hashed = await bcrypt.hash('pass123', 10);
    const repo = AppDataSource.getRepository(User);
    const saved = await repo.save(
      repo.create({ email: 'partner@test.com', password: hashed, tenantId: tenant.id, phone: '+9779841000000' }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.tenantId).toBe(tenant.id);
    expect(found.phone).toBe('+9779841000000');
  });

  it('saves a user with null tenantId', async () => {
    const hashed = await bcrypt.hash('pass123', 10);
    const repo = AppDataSource.getRepository(User);
    const saved = await repo.save(
      repo.create({ email: 'platform@test.com', password: hashed }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.tenantId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm test:integration -- --testPathPattern=user-entity
```

Expected: FAIL — `Property 'tenantId' does not exist` or column not found.

- [ ] **Step 3: Update `src/database/entities/user.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Tenant } from './tenant.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['tenantId'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ length: 50, nullable: true })
  phone: string | null;

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'blocked';

  @Column({ nullable: true })
  lastLoginAt: Date;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant | null;

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

- [ ] **Step 4: Generate migration timestamp**

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"
```

Save the output as `TS` (e.g. `260626143022001`). Use it as both the filename prefix and the class name suffix in the next step.

- [ ] **Step 5: Create `src/database/migrations/<TS>-ExtendUsersWithTenantAndPhone.ts`**

Replace `<TS>` with your generated timestamp:

```typescript
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class ExtendUsersWithTenantAndPhone<TS> implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'tenantId', type: 'uuid', isNullable: true }),
      new TableColumn({ name: 'phone', type: 'varchar', length: '50', isNullable: true }),
    ]);

    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['tenantId'] }));

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const fk = table!.foreignKeys.find((f) => f.columnNames.includes('tenantId'));
    if (fk) await queryRunner.dropForeignKey('users', fk);
    const idx = table!.indices.find((i) => i.columnNames.includes('tenantId') && !i.isUnique);
    if (idx) await queryRunner.dropIndex('users', idx);
    await queryRunner.dropColumns('users', ['tenantId', 'phone']);
  }
}
```

- [ ] **Step 6: Run migration**

```bash
pnpm migration:run
```

Expected: `ExtendUsersWithTenantAndPhone<TS> has been executed successfully.`

- [ ] **Step 7: Verify**

```bash
pnpm migration:show
```

Expected: `[X] ExtendUsersWithTenantAndPhone<TS>` in the list.

- [ ] **Step 8: Run test — expect pass**

```bash
pnpm test:integration -- --testPathPattern=user-entity
```

Expected: PASS — 2 tests pass.

- [ ] **Step 9: Format, lint, typecheck, commit**

```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck
git add src/database/entities/user.entity.ts \
        src/database/migrations/<TS>-ExtendUsersWithTenantAndPhone.ts \
        tests/integration/user-entity.test.ts
git commit -m "feat: extend users table with tenantId FK and phone field"
```

---

### Task 3: Extend TenantConfiguration entity + migration

**Files:**
- Modify: `src/database/entities/tenant-configuration.entity.ts`
- Create: `src/database/migrations/<TIMESTAMP>-ExtendTenantConfigurationsWithTestStatus.ts`
- Create: `tests/integration/tenant-configuration-entity.test.ts`

**Interfaces:**
- Consumes: `IntegrationTestStatus` from Task 1
- Produces: `TenantConfiguration.lastTestedAt`, `TenantConfiguration.testStatus` — used by integration toggle UX in `dashboard/`

- [ ] **Step 1: Write the failing test**

Create `tests/integration/tenant-configuration-entity.test.ts`:

```typescript
import { AppDataSource } from '../../src/database/data-source';
import { Tenant, TenantConfiguration } from '../../src/database/entities';
import { IntegrationTestStatus, TenantConfigProvider, TenantConfigType } from '../../src/common/enums/tenant.enums';
import { truncateAll } from '../helpers/db.helper';

async function seedTenant() {
  return AppDataSource.getRepository(Tenant).save(
    AppDataSource.getRepository(Tenant).create({ code: 'CFG-001', slug: 'cfg-tenant', legalName: 'Config Co' }),
  );
}

describe('TenantConfiguration — lastTestedAt + testStatus', () => {
  beforeEach(async () => {
    await truncateAll(['tenant_configurations', 'tenants']);
  });

  it('saves a configuration with testStatus and lastTestedAt', async () => {
    const tenant = await seedTenant();
    const repo = AppDataSource.getRepository(TenantConfiguration);
    const testedAt = new Date();
    const saved = await repo.save(
      repo.create({
        tenantId: tenant.id,
        configType: TenantConfigType.SHIPMENT,
        provider: TenantConfigProvider.DHL,
        testStatus: IntegrationTestStatus.SUCCESS,
        lastTestedAt: testedAt,
      }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.testStatus).toBe(IntegrationTestStatus.SUCCESS);
    expect(found.lastTestedAt).toBeDefined();
  });

  it('defaults testStatus to untested when not provided', async () => {
    const tenant = await seedTenant();
    const repo = AppDataSource.getRepository(TenantConfiguration);
    const saved = await repo.save(
      repo.create({
        tenantId: tenant.id,
        configType: TenantConfigType.PAYMENT,
        provider: TenantConfigProvider.STRIPE,
      }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.testStatus).toBe(IntegrationTestStatus.UNTESTED);
    expect(found.lastTestedAt).toBeNull();
  });

  it('accepts new providers like ConnectIPS and Fonepay', async () => {
    const tenant = await seedTenant();
    const repo = AppDataSource.getRepository(TenantConfiguration);
    const saved = await repo.save(
      repo.create({
        tenantId: tenant.id,
        configType: TenantConfigType.PAYMENT,
        provider: TenantConfigProvider.CONNECTIPS,
      }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.provider).toBe('ConnectIPS');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm test:integration -- --testPathPattern=tenant-configuration-entity
```

Expected: FAIL — `testStatus` property not found on entity.

- [ ] **Step 3: Update `src/database/entities/tenant-configuration.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import {
  IntegrationTestStatus,
  TenantConfigProvider,
  TenantConfigType,
} from '../../common/enums/tenant.enums';
import { Tenant } from './tenant.entity';

@Entity('tenant_configurations')
@Unique(['tenantId', 'configType', 'provider'])
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 30, enum: TenantConfigType })
  configType: TenantConfigType;

  @Column({ type: 'varchar', length: 50 })
  provider: TenantConfigProvider;

  @Column({ length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'jsonb', nullable: true })
  credentials: Record<string, unknown>;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: false })
  sandbox: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: IntegrationTestStatus.UNTESTED,
    enum: IntegrationTestStatus,
  })
  testStatus: IntegrationTestStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastTestedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.configurations)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

- [ ] **Step 4: Generate migration timestamp**

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"
```

Save output as `TS`.

- [ ] **Step 5: Create `src/database/migrations/<TS>-ExtendTenantConfigurationsWithTestStatus.ts`**

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ExtendTenantConfigurationsWithTestStatus<TS> implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('tenant_configurations', [
      new TableColumn({
        name: 'testStatus',
        type: 'varchar',
        length: '20',
        default: "'untested'",
      }),
      new TableColumn({
        name: 'lastTestedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('tenant_configurations', ['testStatus', 'lastTestedAt']);
  }
}
```

- [ ] **Step 6: Run migration + verify**

```bash
pnpm migration:run && pnpm migration:show
```

Expected: migration shows `[X]`.

- [ ] **Step 7: Run test — expect pass**

```bash
pnpm test:integration -- --testPathPattern=tenant-configuration-entity
```

Expected: PASS — 3 tests pass.

- [ ] **Step 8: Format, lint, typecheck, commit**

```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck
git add src/database/entities/tenant-configuration.entity.ts \
        src/database/migrations/<TS>-ExtendTenantConfigurationsWithTestStatus.ts \
        tests/integration/tenant-configuration-entity.test.ts
git commit -m "feat: add testStatus and lastTestedAt to tenant_configurations; extend TenantConfigProvider enum"
```

---

### Task 4: Rate engine entities + migration (Zone, RateCard, WeightTier)

**Files:**
- Create: `src/database/entities/zone.entity.ts`
- Create: `src/database/entities/rate-card.entity.ts`
- Create: `src/database/entities/weight-tier.entity.ts`
- Modify: `src/database/entities/index.ts` (export new entities)
- Create: `src/database/migrations/<TIMESTAMP>-CreateRateEngine.ts`
- Create: `tests/integration/rate-engine-entity.test.ts`

**Interfaces:**
- Consumes: `RateCardType` from Task 1, `Tenant` entity, `TenantConfiguration` entity
- Produces: `Zone`, `RateCard`, `WeightTier` entities — FK targets for Booking in Task 6

- [ ] **Step 1: Write the failing test**

Create `tests/integration/rate-engine-entity.test.ts`:

```typescript
import { AppDataSource } from '../../src/database/data-source';
import { Tenant } from '../../src/database/entities';
import { Zone } from '../../src/database/entities/zone.entity';
import { RateCard } from '../../src/database/entities/rate-card.entity';
import { WeightTier } from '../../src/database/entities/weight-tier.entity';
import { RateCardType } from '../../src/common/enums/rate.enums';
import { truncateAll } from '../helpers/db.helper';

async function seedTenant() {
  return AppDataSource.getRepository(Tenant).save(
    AppDataSource.getRepository(Tenant).create({ code: 'RATE-001', slug: 'rate-tenant', legalName: 'Rate Co' }),
  );
}

describe('Rate engine entities', () => {
  beforeEach(async () => {
    await truncateAll(['weight_tiers', 'rate_cards', 'zones', 'tenants']);
  });

  it('creates a zone and retrieves it', async () => {
    const tenant = await seedTenant();
    const zoneRepo = AppDataSource.getRepository(Zone);
    const zone = await zoneRepo.save(
      zoneRepo.create({ tenantId: tenant.id, name: 'South Asia', countries: ['NP', 'IN', 'BD'] }),
    );
    const found = await zoneRepo.findOneByOrFail({ id: zone.id });
    expect(found.name).toBe('South Asia');
    expect(found.countries).toEqual(['NP', 'IN', 'BD']);
  });

  it('creates a zone-based rate card with weight tiers', async () => {
    const tenant = await seedTenant();
    const zoneRepo = AppDataSource.getRepository(Zone);
    const rateRepo = AppDataSource.getRepository(RateCard);
    const tierRepo = AppDataSource.getRepository(WeightTier);

    const origin = await zoneRepo.save(zoneRepo.create({ tenantId: tenant.id, name: 'Zone A', countries: ['NP'] }));
    const dest = await zoneRepo.save(zoneRepo.create({ tenantId: tenant.id, name: 'Zone B', countries: ['AE'] }));

    const card = await rateRepo.save(
      rateRepo.create({
        tenantId: tenant.id,
        name: 'NP to AE Standard',
        type: RateCardType.ZONE,
        originZoneId: origin.id,
        destinationZoneId: dest.id,
        currency: 'NPR',
      }),
    );

    await tierRepo.save(tierRepo.create({ rateCardId: card.id, minKg: 0, maxKg: 1, pricePerKg: 500, flatPrice: null }));
    await tierRepo.save(tierRepo.create({ rateCardId: card.id, minKg: 1, maxKg: 5, pricePerKg: 400, flatPrice: null }));

    const tiers = await tierRepo.findBy({ rateCardId: card.id });
    expect(tiers).toHaveLength(2);
    expect(tiers[0].pricePerKg).toBe('500'); // numeric columns come back as strings from pg driver
  });

  it('creates a route-based flat rate card', async () => {
    const tenant = await seedTenant();
    const rateRepo = AppDataSource.getRepository(RateCard);
    const card = await rateRepo.save(
      rateRepo.create({
        tenantId: tenant.id,
        name: 'KTM to PKR',
        type: RateCardType.ROUTE,
        originCountry: 'NP',
        originCity: 'Kathmandu',
        destinationCountry: 'NP',
        destinationCity: 'Pokhara',
        currency: 'NPR',
      }),
    );
    const found = await rateRepo.findOneByOrFail({ id: card.id });
    expect(found.originCity).toBe('Kathmandu');
    expect(found.type).toBe(RateCardType.ROUTE);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm test:integration -- --testPathPattern=rate-engine-entity
```

Expected: FAIL — modules `zone.entity`, `rate-card.entity`, `weight-tier.entity` not found.

- [ ] **Step 3: Create `src/database/entities/zone.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('zones')
@Index(['tenantId'])
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  /** ISO 3166-1 alpha-2 country codes, e.g. ["NP","IN"]. */
  @Column({ type: 'jsonb', default: '[]' })
  countries: string[];

  /** Optional city-level granularity, e.g. ["Kathmandu","Pokhara"]. */
  @Column({ type: 'jsonb', default: '[]' })
  cities: string[];

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 4: Create `src/database/entities/rate-card.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { RateCardType } from '../../common/enums/rate.enums';
import { Tenant } from './tenant.entity';
import { Zone } from './zone.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { WeightTier } from './weight-tier.entity';

@Entity('rate_cards')
@Index(['tenantId'])
@Index(['tenantId', 'active'])
export class RateCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, enum: RateCardType })
  type: RateCardType;

  /** FK to Zone — used when type = zone. */
  @Column({ type: 'uuid', nullable: true })
  originZoneId: string | null;

  @Column({ type: 'uuid', nullable: true })
  destinationZoneId: string | null;

  /** Direct country/city fields — used when type = route or flat. */
  @Column({ length: 10, nullable: true })
  originCountry: string | null;

  @Column({ length: 255, nullable: true })
  originCity: string | null;

  @Column({ length: 10, nullable: true })
  destinationCountry: string | null;

  @Column({ length: 255, nullable: true })
  destinationCity: string | null;

  /** Optional link to a delivery carrier integration. */
  @Column({ type: 'uuid', nullable: true })
  integrationId: string | null;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => Zone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'originZoneId' })
  originZone: Zone | null;

  @ManyToOne(() => Zone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationZoneId' })
  destinationZone: Zone | null;

  @ManyToOne(() => TenantConfiguration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'integrationId' })
  integration: TenantConfiguration | null;

  @OneToMany(() => WeightTier, (tier) => tier.rateCard, { cascade: true })
  weightTiers: WeightTier[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 5: Create `src/database/entities/weight-tier.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RateCard } from './rate-card.entity';

@Entity('weight_tiers')
@Index(['rateCardId'])
export class WeightTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  rateCardId: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  minKg: number;

  /** null means "and above" — no upper bound. */
  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  maxKg: number | null;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  pricePerKg: number;

  /** Flat charge added on top of per-kg price; null = no flat charge. */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  flatPrice: number | null;

  @ManyToOne(() => RateCard, (card) => card.weightTiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rateCardId' })
  rateCard: RateCard;
}
```

- [ ] **Step 6: Generate migration timestamp and create the migration**

Generate timestamp:
```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"
```

Create `src/database/migrations/<TS>-CreateRateEngine.ts`:

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRateEngine<TS> implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── zones ─────────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'zones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'countries', type: 'jsonb', default: "'[]'" },
          { name: 'cities', type: 'jsonb', default: "'[]'" },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [new TableIndex({ columnNames: ['tenantId'] })],
      }),
      true,
    );

    // ── rate_cards ────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'rate_cards',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'type', type: 'varchar', length: '20' },
          { name: 'originZoneId', type: 'uuid', isNullable: true },
          { name: 'destinationZoneId', type: 'uuid', isNullable: true },
          { name: 'originCountry', type: 'varchar', length: '10', isNullable: true },
          { name: 'originCity', type: 'varchar', length: '255', isNullable: true },
          { name: 'destinationCountry', type: 'varchar', length: '10', isNullable: true },
          { name: 'destinationCity', type: 'varchar', length: '255', isNullable: true },
          { name: 'integrationId', type: 'uuid', isNullable: true },
          { name: 'currency', type: 'varchar', length: '10', default: "'USD'" },
          { name: 'active', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['tenantId', 'active'] }),
        ],
      }),
      true,
    );

    // ── weight_tiers ──────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'weight_tiers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rateCardId', type: 'uuid' },
          { name: 'minKg', type: 'numeric', precision: 10, scale: 3 },
          { name: 'maxKg', type: 'numeric', precision: 10, scale: 3, isNullable: true },
          { name: 'pricePerKg', type: 'numeric', precision: 18, scale: 2 },
          { name: 'flatPrice', type: 'numeric', precision: 18, scale: 2, isNullable: true },
        ],
        indices: [new TableIndex({ columnNames: ['rateCardId'] })],
      }),
      true,
    );

    // ── foreign keys ──────────────────────────────────────────────────────────
    await queryRunner.createForeignKey('zones', new TableForeignKey({
      columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('rate_cards', new TableForeignKey({
      columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('rate_cards', new TableForeignKey({
      columnNames: ['originZoneId'], referencedTableName: 'zones', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('rate_cards', new TableForeignKey({
      columnNames: ['destinationZoneId'], referencedTableName: 'zones', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('rate_cards', new TableForeignKey({
      columnNames: ['integrationId'], referencedTableName: 'tenant_configurations', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('weight_tiers', new TableForeignKey({
      columnNames: ['rateCardId'], referencedTableName: 'rate_cards', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['weight_tiers', 'rate_cards', 'zones']) {
      const t = await queryRunner.getTable(table);
      if (t) await queryRunner.dropForeignKeys(table, t.foreignKeys);
    }
    await queryRunner.dropTable('weight_tiers');
    await queryRunner.dropTable('rate_cards');
    await queryRunner.dropTable('zones');
  }
}
```

- [ ] **Step 7: Export entities from `src/database/entities/index.ts`**

Append to the existing exports:

```typescript
export { Zone } from './zone.entity';
export { RateCard } from './rate-card.entity';
export { WeightTier } from './weight-tier.entity';
```

- [ ] **Step 8: Run migration**

```bash
pnpm migration:run && pnpm migration:show
```

Expected: `CreateRateEngine<TS>` shows `[X]`.

- [ ] **Step 9: Run test — expect pass**

```bash
pnpm test:integration -- --testPathPattern=rate-engine-entity
```

Expected: PASS — 3 tests pass.

- [ ] **Step 10: Format, lint, typecheck, commit**

```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck
git add src/database/entities/zone.entity.ts \
        src/database/entities/rate-card.entity.ts \
        src/database/entities/weight-tier.entity.ts \
        src/database/entities/index.ts \
        src/database/migrations/<TS>-CreateRateEngine.ts \
        tests/integration/rate-engine-entity.test.ts
git commit -m "feat: add Zone, RateCard, WeightTier entities and rate engine migration"
```

---

### Task 5: Agent entity + migration

**Files:**
- Create: `src/database/entities/agent.entity.ts`
- Modify: `src/database/entities/index.ts`
- Create: `src/database/migrations/<TIMESTAMP>-CreateAgents.ts`
- Create: `tests/integration/agent-entity.test.ts`

**Interfaces:**
- Consumes: `AgentAccountType`, `AgentServiceType` from Task 1; `User.tenantId` from Task 2; `Tenant` entity
- Produces: `Agent` entity with `Agent.id`, `Agent.tenantId`, `Agent.userId`, `Agent.accountType`, `Agent.creditLimit`, `Agent.walletBalance`, `Agent.scopeRegions`, `Agent.scopeServiceTypes` — FK target for Booking in Task 6

- [ ] **Step 1: Write the failing test**

Create `tests/integration/agent-entity.test.ts`:

```typescript
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../src/database/data-source';
import { Tenant, User } from '../../src/database/entities';
import { Agent } from '../../src/database/entities/agent.entity';
import { AgentAccountType, AgentServiceType } from '../../src/common/enums/agent.enums';
import { truncateAll } from '../helpers/db.helper';

async function seedTenantAndUser() {
  const tenant = await AppDataSource.getRepository(Tenant).save(
    AppDataSource.getRepository(Tenant).create({ code: 'AGT-001', slug: 'agent-tenant', legalName: 'Agent Co' }),
  );
  const user = await AppDataSource.getRepository(User).save(
    AppDataSource.getRepository(User).create({
      email: 'agent@test.com',
      password: await bcrypt.hash('pass', 10),
      tenantId: tenant.id,
    }),
  );
  return { tenant, user };
}

describe('Agent entity', () => {
  beforeEach(async () => {
    await truncateAll(['agents', 'user_roles', 'users', 'tenants']);
  });

  it('creates a credit-type agent', async () => {
    const { tenant, user } = await seedTenantAndUser();
    const repo = AppDataSource.getRepository(Agent);
    const saved = await repo.save(
      repo.create({
        tenantId: tenant.id,
        userId: user.id,
        accountType: AgentAccountType.CREDIT,
        creditLimit: 50000,
        walletBalance: 0,
        scopeRegions: ['NP'],
        scopeServiceTypes: [AgentServiceType.INTERNATIONAL, AgentServiceType.DOMESTIC],
      }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.accountType).toBe(AgentAccountType.CREDIT);
    expect(found.creditLimit).toBe('50000');
    expect(found.scopeRegions).toEqual(['NP']);
    expect(found.scopeServiceTypes).toContain(AgentServiceType.INTERNATIONAL);
  });

  it('creates a regular-type agent with wallet balance', async () => {
    const { tenant, user } = await seedTenantAndUser();
    const repo = AppDataSource.getRepository(Agent);
    const saved = await repo.save(
      repo.create({
        tenantId: tenant.id,
        userId: user.id,
        accountType: AgentAccountType.REGULAR,
        walletBalance: 5000,
        scopeRegions: ['AE', 'US'],
        scopeServiceTypes: [AgentServiceType.INTERNATIONAL],
      }),
    );
    const found = await repo.findOneByOrFail({ id: saved.id });
    expect(found.accountType).toBe(AgentAccountType.REGULAR);
    expect(found.creditLimit).toBeNull();
    expect(found.walletBalance).toBe('5000');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm test:integration -- --testPathPattern=agent-entity
```

Expected: FAIL — `agent.entity` module not found.

- [ ] **Step 3: Create `src/database/entities/agent.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AgentAccountType, AgentServiceType } from '../../common/enums/agent.enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('agents')
@Index(['tenantId'])
@Index(['userId'], { unique: true })
@Index(['tenantId', 'active'])
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: AgentAccountType.REGULAR, enum: AgentAccountType })
  accountType: AgentAccountType;

  /** Maximum negative balance allowed for credit-type agents; null for regular. */
  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  creditLimit: number | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  walletBalance: number;

  /** ISO country/city codes this agent is scoped to, e.g. ["NP","Kathmandu"]. */
  @Column({ type: 'jsonb', default: '[]' })
  scopeRegions: string[];

  @Column({ type: 'jsonb', default: '[]' })
  scopeServiceTypes: AgentServiceType[];

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 4: Generate timestamp and create migration**

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"
```

Create `src/database/migrations/<TS>-CreateAgents.ts`:

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAgents<TS> implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid' },
          { name: 'userId', type: 'uuid', isUnique: true },
          { name: 'accountType', type: 'varchar', length: '20', default: "'regular'" },
          { name: 'creditLimit', type: 'numeric', precision: 18, scale: 2, isNullable: true },
          { name: 'walletBalance', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'scopeRegions', type: 'jsonb', default: "'[]'" },
          { name: 'scopeServiceTypes', type: 'jsonb', default: "'[]'" },
          { name: 'active', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['userId'], isUnique: true }),
          new TableIndex({ columnNames: ['tenantId', 'active'] }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('agents', new TableForeignKey({
      columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('agents', new TableForeignKey({
      columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const t = await queryRunner.getTable('agents');
    if (t) await queryRunner.dropForeignKeys('agents', t.foreignKeys);
    await queryRunner.dropTable('agents');
  }
}
```

- [ ] **Step 5: Export from index**

Append to `src/database/entities/index.ts`:

```typescript
export { Agent } from './agent.entity';
```

- [ ] **Step 6: Run migration**

```bash
pnpm migration:run && pnpm migration:show
```

Expected: `CreateAgents<TS>` shows `[X]`.

- [ ] **Step 7: Run test — expect pass**

```bash
pnpm test:integration -- --testPathPattern=agent-entity
```

Expected: PASS — 2 tests pass.

- [ ] **Step 8: Format, lint, typecheck, commit**

```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck
git add src/database/entities/agent.entity.ts \
        src/database/entities/index.ts \
        src/database/migrations/<TS>-CreateAgents.ts \
        tests/integration/agent-entity.test.ts
git commit -m "feat: add Agent entity and agents migration"
```

---

### Task 6: Booking cluster entities + migration

**Files:**
- Create: `src/database/entities/booking.entity.ts`
- Create: `src/database/entities/booking-parcel.entity.ts`
- Create: `src/database/entities/booking-document.entity.ts`
- Create: `src/database/entities/booking-status-history.entity.ts`
- Create: `src/database/entities/quote-request.entity.ts`
- Modify: `src/database/entities/index.ts`
- Create: `src/database/migrations/<TIMESTAMP>-CreateBookingCluster.ts`
- Create: `tests/integration/booking-entity.test.ts`

**Interfaces:**
- Consumes: `BookingSource`, `BookingStatus`, `ProtectionType`, `BookingDocumentType`, `QuoteStatus` from Task 1; `Agent` from Task 5; `RateCard` from Task 4; `TenantConfiguration`; `Tenant`; `User`
- Produces: `Booking.id`, `Booking.airwayBillNumber`, `Booking.status` — core entity for all booking operations in Plans 2–4

- [ ] **Step 1: Write the failing test**

Create `tests/integration/booking-entity.test.ts`:

```typescript
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../src/database/data-source';
import { Tenant, User } from '../../src/database/entities';
import { Booking } from '../../src/database/entities/booking.entity';
import { BookingParcel } from '../../src/database/entities/booking-parcel.entity';
import { BookingDocument } from '../../src/database/entities/booking-document.entity';
import { BookingStatusHistory } from '../../src/database/entities/booking-status-history.entity';
import { QuoteRequest } from '../../src/database/entities/quote-request.entity';
import { BookingSource, BookingStatus, BookingDocumentType, ProtectionType, QuoteStatus } from '../../src/common/enums/booking.enums';
import { truncateAll } from '../helpers/db.helper';

async function seedTenantAndUser() {
  const tenant = await AppDataSource.getRepository(Tenant).save(
    AppDataSource.getRepository(Tenant).create({ code: 'BKG-001', slug: 'booking-tenant', legalName: 'Booking Co' }),
  );
  const user = await AppDataSource.getRepository(User).save(
    AppDataSource.getRepository(User).create({
      email: 'booker@test.com',
      password: await bcrypt.hash('pass', 10),
      tenantId: tenant.id,
    }),
  );
  return { tenant, user };
}

describe('Booking cluster entities', () => {
  beforeEach(async () => {
    await truncateAll([
      'quote_requests', 'booking_status_history', 'booking_documents', 'booking_parcels', 'bookings',
      'user_roles', 'users', 'tenants',
    ]);
  });

  it('creates a booking with parcels and status history', async () => {
    const { tenant, user } = await seedTenantAndUser();
    const bookingRepo = AppDataSource.getRepository(Booking);
    const parcelRepo = AppDataSource.getRepository(BookingParcel);
    const historyRepo = AppDataSource.getRepository(BookingStatusHistory);

    const booking = await bookingRepo.save(
      bookingRepo.create({
        tenantId: tenant.id,
        airwayBillNumber: 'AWB-TEST-001',
        source: BookingSource.MANUAL,
        createdByUserId: user.id,
        senderName: 'Alice',
        senderEmail: 'alice@example.com',
        senderPhone: '+1234567890',
        senderAddressLine1: '123 Main St',
        senderCity: 'Kathmandu',
        senderCountry: 'NP',
        receiverName: 'Bob',
        receiverEmail: 'bob@example.com',
        receiverPhone: '+9876543210',
        receiverAddressLine1: '456 Sheikh Zayed Rd',
        receiverCity: 'Dubai',
        receiverCountry: 'AE',
        protectionType: ProtectionType.FREE,
        status: BookingStatus.CONFIRMED,
        totalWeightKg: 2.5,
        shippingCost: 1500,
        protectionCost: 0,
        tax: 0,
        total: 1500,
        currency: 'NPR',
      }),
    );

    await parcelRepo.save(
      parcelRepo.create({
        bookingId: booking.id,
        lengthCm: 30, widthCm: 20, heightCm: 15, weightKg: 2.5,
        contents: 'Electronics',
        itemValue: 5000,
        currency: 'NPR',
        additionalHandling: false,
        handlingLabel: false,
      }),
    );

    await historyRepo.save(
      historyRepo.create({ bookingId: booking.id, status: BookingStatus.CONFIRMED, createdByUserId: user.id }),
    );

    const found = await bookingRepo.findOneByOrFail({ id: booking.id });
    expect(found.airwayBillNumber).toBe('AWB-TEST-001');
    expect(found.status).toBe(BookingStatus.CONFIRMED);

    const parcels = await parcelRepo.findBy({ bookingId: booking.id });
    expect(parcels).toHaveLength(1);

    const history = await historyRepo.findBy({ bookingId: booking.id });
    expect(history).toHaveLength(1);
  });

  it('creates a booking document', async () => {
    const { tenant, user } = await seedTenantAndUser();
    const booking = await AppDataSource.getRepository(Booking).save(
      AppDataSource.getRepository(Booking).create({
        tenantId: tenant.id, airwayBillNumber: 'AWB-DOC-001', source: BookingSource.MANUAL,
        createdByUserId: user.id, senderName: 'S', senderEmail: 's@s.com', senderPhone: '+1',
        senderAddressLine1: 'A', senderCity: 'C', senderCountry: 'NP',
        receiverName: 'R', receiverEmail: 'r@r.com', receiverPhone: '+2',
        receiverAddressLine1: 'B', receiverCity: 'D', receiverCountry: 'AE',
        protectionType: ProtectionType.OPT_OUT, status: BookingStatus.DRAFT,
        totalWeightKg: 1, shippingCost: 500, protectionCost: 0, tax: 0, total: 500, currency: 'NPR',
      }),
    );
    const docRepo = AppDataSource.getRepository(BookingDocument);
    const doc = await docRepo.save(
      docRepo.create({ bookingId: booking.id, documentType: BookingDocumentType.AIRWAYBILL, filePath: 'uploads/awb-001.pdf' }),
    );
    const found = await docRepo.findOneByOrFail({ id: doc.id });
    expect(found.documentType).toBe(BookingDocumentType.AIRWAYBILL);
    expect(found.filePath).toBe('uploads/awb-001.pdf');
  });

  it('creates a quote request and links it to a booking on accept', async () => {
    const { tenant } = await seedTenantAndUser();
    const quoteRepo = AppDataSource.getRepository(QuoteRequest);
    const bookingRepo = AppDataSource.getRepository(Booking);

    const quote = await quoteRepo.save(
      quoteRepo.create({
        tenantId: tenant.id,
        originCountry: 'NP',
        destinationCountry: 'AE',
        weightKg: 3,
        requesterEmail: 'customer@example.com',
        status: QuoteStatus.PENDING,
      }),
    );

    expect(quote.bookingId).toBeNull();
    expect(quote.status).toBe(QuoteStatus.PENDING);

    // Simulate accept: update status + link booking
    await quoteRepo.update(quote.id, { status: QuoteStatus.ACCEPTED });
    const updated = await quoteRepo.findOneByOrFail({ id: quote.id });
    expect(updated.status).toBe(QuoteStatus.ACCEPTED);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
pnpm test:integration -- --testPathPattern=booking-entity
```

Expected: FAIL — entity modules not found.

- [ ] **Step 3: Create `src/database/entities/booking.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BookingSource, BookingStatus, ProtectionType } from '../../common/enums/booking.enums';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Agent } from './agent.entity';
import { RateCard } from './rate-card.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { BookingParcel } from './booking-parcel.entity';
import { BookingDocument } from './booking-document.entity';
import { BookingStatusHistory } from './booking-status-history.entity';

@Entity('bookings')
@Index(['tenantId'])
@Index(['tenantId', 'status'])
@Index(['airwayBillNumber'], { unique: true })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ length: 100, unique: true })
  airwayBillNumber: string;

  @Column({ type: 'varchar', length: 30, enum: BookingSource })
  source: BookingSource;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByAgentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  rateCardId: string | null;

  @Column({ type: 'uuid', nullable: true })
  integrationId: string | null;

  // Sender
  @Column({ length: 255 })
  senderName: string;

  @Column({ length: 255 })
  senderEmail: string;

  @Column({ length: 50 })
  senderPhone: string;

  @Column({ length: 255 })
  senderAddressLine1: string;

  @Column({ length: 255, nullable: true })
  senderAddressLine2: string | null;

  @Column({ length: 255 })
  senderCity: string;

  @Column({ length: 255, nullable: true })
  senderState: string | null;

  @Column({ length: 20, nullable: true })
  senderZip: string | null;

  @Column({ length: 10 })
  senderCountry: string;

  // Receiver
  @Column({ length: 255 })
  receiverName: string;

  @Column({ length: 255 })
  receiverEmail: string;

  @Column({ length: 50 })
  receiverPhone: string;

  @Column({ length: 255 })
  receiverAddressLine1: string;

  @Column({ length: 255, nullable: true })
  receiverAddressLine2: string | null;

  @Column({ length: 255 })
  receiverCity: string;

  @Column({ length: 255, nullable: true })
  receiverState: string | null;

  @Column({ length: 20, nullable: true })
  receiverZip: string | null;

  @Column({ length: 10 })
  receiverCountry: string;

  // Return address
  @Column({ default: true })
  returnAddressSameAsSender: boolean;

  @Column({ length: 255, nullable: true })
  returnAddressLine1: string | null;

  @Column({ length: 255, nullable: true })
  returnAddressCity: string | null;

  @Column({ length: 10, nullable: true })
  returnAddressCountry: string | null;

  // Protection
  @Column({ type: 'varchar', length: 20, default: ProtectionType.FREE, enum: ProtectionType })
  protectionType: ProtectionType;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  protectionValue: number | null;

  // Status + financials
  @Column({ type: 'varchar', length: 30, default: BookingStatus.DRAFT, enum: BookingStatus })
  status: BookingStatus;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  totalWeightKg: number;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  shippingCost: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  protectionCost: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  total: number;

  @Column({ length: 10, default: 'NPR' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User | null;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByAgentId' })
  createdByAgent: Agent | null;

  @ManyToOne(() => RateCard, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rateCardId' })
  rateCard: RateCard | null;

  @ManyToOne(() => TenantConfiguration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'integrationId' })
  integration: TenantConfiguration | null;

  @OneToMany(() => BookingParcel, (p) => p.booking, { cascade: true })
  parcels: BookingParcel[];

  @OneToMany(() => BookingDocument, (d) => d.booking, { cascade: true })
  documents: BookingDocument[];

  @OneToMany(() => BookingStatusHistory, (h) => h.booking, { cascade: true })
  statusHistory: BookingStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 4: Create `src/database/entities/booking-parcel.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_parcels')
@Index(['bookingId'])
export class BookingParcel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  lengthCm: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  widthCm: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  heightCm: number;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  weightKg: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  itemValue: number;

  @Column({ length: 10, default: 'NPR' })
  currency: string;

  @Column({ default: false })
  additionalHandling: boolean;

  @Column({ default: false })
  handlingLabel: boolean;

  @ManyToOne(() => Booking, (b) => b.parcels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
```

- [ ] **Step 5: Create `src/database/entities/booking-document.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BookingDocumentType } from '../../common/enums/booking.enums';
import { Booking } from './booking.entity';

@Entity('booking_documents')
@Index(['bookingId'])
export class BookingDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', length: 30, enum: BookingDocumentType })
  documentType: BookingDocumentType;

  /** S3 key or local path via storage abstraction. */
  @Column({ length: 512 })
  filePath: string;

  @CreateDateColumn()
  generatedAt: Date;

  @ManyToOne(() => Booking, (b) => b.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
```

- [ ] **Step 6: Create `src/database/entities/booking-status-history.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BookingStatus } from '../../common/enums/booking.enums';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity('booking_status_history')
@Index(['bookingId'])
export class BookingStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', length: 30, enum: BookingStatus })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @ManyToOne(() => Booking, (b) => b.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 7: Create `src/database/entities/quote-request.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { QuoteStatus } from '../../common/enums/booking.enums';
import { Tenant } from './tenant.entity';
import { Booking } from './booking.entity';

@Entity('quote_requests')
@Index(['tenantId'])
@Index(['status'])
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ length: 10 })
  originCountry: string;

  @Column({ length: 10 })
  destinationCountry: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  weightKg: number;

  @Column({ length: 255, nullable: true })
  requesterEmail: string | null;

  @Column({ type: 'varchar', length: 20, default: QuoteStatus.PENDING, enum: QuoteStatus })
  status: QuoteStatus;

  @Column({ type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant | null;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 8: Generate timestamp and create the migration**

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(\`\${p(d.getUTCFullYear()%100)}\${p(d.getUTCMonth()+1)}\${p(d.getUTCDate())}\${p(d.getUTCHours())}\${p(d.getUTCMinutes())}\${p(d.getUTCSeconds())}\${p(d.getUTCMilliseconds(),3)}\`)"
```

Create `src/database/migrations/<TS>-CreateBookingCluster.ts`:

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateBookingCluster<TS> implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── bookings ──────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid' },
          { name: 'airwayBillNumber', type: 'varchar', length: '100', isUnique: true },
          { name: 'source', type: 'varchar', length: '30' },
          { name: 'createdByUserId', type: 'uuid', isNullable: true },
          { name: 'createdByAgentId', type: 'uuid', isNullable: true },
          { name: 'rateCardId', type: 'uuid', isNullable: true },
          { name: 'integrationId', type: 'uuid', isNullable: true },
          { name: 'senderName', type: 'varchar', length: '255' },
          { name: 'senderEmail', type: 'varchar', length: '255' },
          { name: 'senderPhone', type: 'varchar', length: '50' },
          { name: 'senderAddressLine1', type: 'varchar', length: '255' },
          { name: 'senderAddressLine2', type: 'varchar', length: '255', isNullable: true },
          { name: 'senderCity', type: 'varchar', length: '255' },
          { name: 'senderState', type: 'varchar', length: '255', isNullable: true },
          { name: 'senderZip', type: 'varchar', length: '20', isNullable: true },
          { name: 'senderCountry', type: 'varchar', length: '10' },
          { name: 'receiverName', type: 'varchar', length: '255' },
          { name: 'receiverEmail', type: 'varchar', length: '255' },
          { name: 'receiverPhone', type: 'varchar', length: '50' },
          { name: 'receiverAddressLine1', type: 'varchar', length: '255' },
          { name: 'receiverAddressLine2', type: 'varchar', length: '255', isNullable: true },
          { name: 'receiverCity', type: 'varchar', length: '255' },
          { name: 'receiverState', type: 'varchar', length: '255', isNullable: true },
          { name: 'receiverZip', type: 'varchar', length: '20', isNullable: true },
          { name: 'receiverCountry', type: 'varchar', length: '10' },
          { name: 'returnAddressSameAsSender', type: 'boolean', default: true },
          { name: 'returnAddressLine1', type: 'varchar', length: '255', isNullable: true },
          { name: 'returnAddressCity', type: 'varchar', length: '255', isNullable: true },
          { name: 'returnAddressCountry', type: 'varchar', length: '10', isNullable: true },
          { name: 'protectionType', type: 'varchar', length: '20', default: "'free'" },
          { name: 'protectionValue', type: 'numeric', precision: 18, scale: 2, isNullable: true },
          { name: 'status', type: 'varchar', length: '30', default: "'draft'" },
          { name: 'totalWeightKg', type: 'numeric', precision: 10, scale: 3 },
          { name: 'shippingCost', type: 'numeric', precision: 18, scale: 2 },
          { name: 'protectionCost', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'tax', type: 'numeric', precision: 18, scale: 2, default: 0 },
          { name: 'total', type: 'numeric', precision: 18, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10', default: "'NPR'" },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['tenantId', 'status'] }),
          new TableIndex({ columnNames: ['airwayBillNumber'], isUnique: true }),
        ],
      }),
      true,
    );

    // ── booking_parcels ───────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'booking_parcels',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'bookingId', type: 'uuid' },
          { name: 'lengthCm', type: 'numeric', precision: 10, scale: 2 },
          { name: 'widthCm', type: 'numeric', precision: 10, scale: 2 },
          { name: 'heightCm', type: 'numeric', precision: 10, scale: 2 },
          { name: 'weightKg', type: 'numeric', precision: 10, scale: 3 },
          { name: 'contents', type: 'text' },
          { name: 'itemValue', type: 'numeric', precision: 18, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10', default: "'NPR'" },
          { name: 'additionalHandling', type: 'boolean', default: false },
          { name: 'handlingLabel', type: 'boolean', default: false },
        ],
        indices: [new TableIndex({ columnNames: ['bookingId'] })],
      }),
      true,
    );

    // ── booking_documents ─────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'booking_documents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'bookingId', type: 'uuid' },
          { name: 'documentType', type: 'varchar', length: '30' },
          { name: 'filePath', type: 'varchar', length: '512' },
          { name: 'generatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [new TableIndex({ columnNames: ['bookingId'] })],
      }),
      true,
    );

    // ── booking_status_history ────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'booking_status_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'bookingId', type: 'uuid' },
          { name: 'status', type: 'varchar', length: '30' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdByUserId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [new TableIndex({ columnNames: ['bookingId'] })],
      }),
      true,
    );

    // ── quote_requests ────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'quote_requests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'uuid', isNullable: true },
          { name: 'originCountry', type: 'varchar', length: '10' },
          { name: 'destinationCountry', type: 'varchar', length: '10' },
          { name: 'weightKg', type: 'numeric', precision: 10, scale: 3 },
          { name: 'requesterEmail', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'pending'" },
          { name: 'bookingId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          new TableIndex({ columnNames: ['tenantId'] }),
          new TableIndex({ columnNames: ['status'] }),
        ],
      }),
      true,
    );

    // ── foreign keys ──────────────────────────────────────────────────────────
    // bookings
    await queryRunner.createForeignKey('bookings', new TableForeignKey({ columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('bookings', new TableForeignKey({ columnNames: ['createdByUserId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('bookings', new TableForeignKey({ columnNames: ['createdByAgentId'], referencedTableName: 'agents', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('bookings', new TableForeignKey({ columnNames: ['rateCardId'], referencedTableName: 'rate_cards', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('bookings', new TableForeignKey({ columnNames: ['integrationId'], referencedTableName: 'tenant_configurations', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    // booking_parcels
    await queryRunner.createForeignKey('booking_parcels', new TableForeignKey({ columnNames: ['bookingId'], referencedTableName: 'bookings', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    // booking_documents
    await queryRunner.createForeignKey('booking_documents', new TableForeignKey({ columnNames: ['bookingId'], referencedTableName: 'bookings', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    // booking_status_history
    await queryRunner.createForeignKey('booking_status_history', new TableForeignKey({ columnNames: ['bookingId'], referencedTableName: 'bookings', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('booking_status_history', new TableForeignKey({ columnNames: ['createdByUserId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    // quote_requests
    await queryRunner.createForeignKey('quote_requests', new TableForeignKey({ columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('quote_requests', new TableForeignKey({ columnNames: ['bookingId'], referencedTableName: 'bookings', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['quote_requests', 'booking_status_history', 'booking_documents', 'booking_parcels', 'bookings']) {
      const t = await queryRunner.getTable(table);
      if (t) await queryRunner.dropForeignKeys(table, t.foreignKeys);
    }
    await queryRunner.dropTable('quote_requests');
    await queryRunner.dropTable('booking_status_history');
    await queryRunner.dropTable('booking_documents');
    await queryRunner.dropTable('booking_parcels');
    await queryRunner.dropTable('bookings');
  }
}
```

- [ ] **Step 9: Run migration**

```bash
pnpm migration:run && pnpm migration:show
```

Expected: `CreateBookingCluster<TS>` shows `[X]`.

- [ ] **Step 10: Run test — expect pass**

```bash
pnpm test:integration -- --testPathPattern=booking-entity
```

Expected: PASS — 3 tests pass.

- [ ] **Step 11: Format, lint, typecheck, commit**

```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck
git add src/database/entities/booking.entity.ts \
        src/database/entities/booking-parcel.entity.ts \
        src/database/entities/booking-document.entity.ts \
        src/database/entities/booking-status-history.entity.ts \
        src/database/entities/quote-request.entity.ts \
        src/database/migrations/<TS>-CreateBookingCluster.ts \
        tests/integration/booking-entity.test.ts
git commit -m "feat: add Booking cluster entities and booking tables migration"
```

---

### Task 7: Register all new entities in `src/database/entities/index.ts`

**Files:**
- Modify: `src/database/entities/index.ts`

**Interfaces:**
- Produces: all new entities importable via `@database/entities` — required for Plans 2–4

> Note: Zone, RateCard, WeightTier, and Agent were partially registered in their respective tasks. This task ensures all five booking-cluster entities are also exported and the file is complete.

- [ ] **Step 1: Replace `src/database/entities/index.ts` with the complete version**

```typescript
export { User } from './user.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';
export { Tenant } from './tenant.entity';
export { Plan } from './plan.entity';
export { PlanFeature } from './plan-feature.entity';
export { TenantPlan } from './tenant-plan.entity';
export { TenantSetting } from './tenant-setting.entity';
export { TenantDomain } from './tenant-domain.entity';
export { TenantConfiguration } from './tenant-configuration.entity';
export { TenantUsage } from './tenant-usage.entity';
export { Country } from './country.entity';
export { SuperAdmin, SuperAdminStatus } from './super-admin.entity';
// Rate engine
export { Zone } from './zone.entity';
export { RateCard } from './rate-card.entity';
export { WeightTier } from './weight-tier.entity';
// Agents
export { Agent } from './agent.entity';
// Bookings
export { Booking } from './booking.entity';
export { BookingParcel } from './booking-parcel.entity';
export { BookingDocument } from './booking-document.entity';
export { BookingStatusHistory } from './booking-status-history.entity';
export { QuoteRequest } from './quote-request.entity';
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Run all integration tests**

```bash
pnpm test:integration
```

Expected: All tests pass (no regressions in existing super-admin tests).

- [ ] **Step 4: Commit**

```bash
git add src/database/entities/index.ts
git commit -m "chore: register all new entities in entities index"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Tenant.slug — already existed; `onboardingCompleted` maps to profile_complete gate
- ✅ Zone entity — Task 4
- ✅ RateCard (zone/route/flat types, vendor link, weight tiers) — Task 4
- ✅ WeightTier — Task 4
- ✅ TenantIntegration → used existing `TenantConfiguration`; extended with testStatus/lastTestedAt — Task 3
- ✅ TenantConfigProvider extended with all new carriers + payment gateways — Task 1
- ✅ Agent (credit/regular, credit limit, wallet, scope regions/service types) — Task 5
- ✅ Booking (all sender/receiver/return fields, protection, financial columns) — Task 6
- ✅ BookingParcel — Task 6
- ✅ BookingDocument — Task 6
- ✅ BookingStatusHistory — Task 6
- ✅ QuoteRequest (nullable tenantId for public-site requests) — Task 6
- ✅ User extended with tenantId + phone — Task 2

**Type consistency:** `airwayBillNumber` used consistently across entity, migration, and test. `BookingStatus` enum values used verbatim in entity and test assertions.

**Placeholder scan:** No TBDs. Migration `<TS>` is not a TBD — it's a runtime value with an explicit generation command shown at each step.
