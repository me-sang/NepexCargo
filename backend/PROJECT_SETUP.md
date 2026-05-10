# Nepex Cargo Backend — Project Setup & Architecture

This is a professional Node.js + Express backend stack designed for a cargo/logistics platform with third-party integrations, background jobs, and event-driven flows.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + TypeORM (with migrations & seeders)
- **Job Queue**: BullMQ + Redis
- **Background Jobs**: Standalone worker process
- **Third-party Integrations**: Stripe, UPS, FedEx, DHL
- **File Storage**: Local or AWS S3
- **Testing**: Jest + Supertest
- **Validation**: Zod
- **Logging**: Winston

---

## Project Structure

```
backend/
├── app.ts                          # Express app setup (middleware, error handler)
├── server.ts                       # Server entry point (DB/Redis init, graceful shutdown)
├── package.json                    # Dependencies & npm scripts
├── tsconfig.json                   # TypeScript config with path aliases
├── nodemon.json                    # Dev server watch config
├── jest.config.ts                  # Test runner config
├── .env.example                    # Environment variables template
│
├── src/
│   ├── config/                     # Configuration files
│   │   ├── env.config.ts           # Environment variable validation (envalid)
│   │   ├── database.config.ts      # TypeORM DataSourceOptions
│   │   ├── redis.config.ts         # Redis client setup
│   │   ├── queue.config.ts         # BullMQ queue defaults
│   │   └── index.ts                # Config barrel export
│   │
│   ├── database/                   # Data layer
│   │   ├── data-source.ts          # TypeORM DataSource instance
│   │   ├── entities/               # TypeORM entity definitions (create here)
│   │   ├── migrations/             # TypeORM migrations (auto-generated)
│   │   ├── repositories/           # Custom TypeORM repository classes
│   │   ├── subscribers/            # TypeORM entity lifecycle subscribers
│   │   └── seeders/
│   │       ├── seeder-tracker.ts   # Idempotent seeder runner
│   │       └── index.ts            # Seeder entry point
│   │
│   ├── integrations/               # Third-party API integrations
│   │   ├── stripe/                 # Payment processing
│   │   │   ├── stripe.client.ts    # Stripe SDK wrapper
│   │   │   ├── stripe.service.ts   # Business logic
│   │   │   └── index.ts
│   │   ├── ups/                    # Shipping carrier
│   │   │   ├── ups.client.ts       # OAuth2 + API client
│   │   │   ├── ups.service.ts      # Rate quotes, shipments, tracking
│   │   │   └── index.ts
│   │   ├── fedex/                  # Shipping carrier
│   │   │   ├── fedex.client.ts     # OAuth2 + API client
│   │   │   ├── fedex.service.ts    # Rate quotes, shipments, tracking
│   │   │   └── index.ts
│   │   ├── dhl/                    # Shipping carrier
│   │   │   ├── dhl.client.ts       # API key client
│   │   │   ├── dhl.service.ts      # Rate quotes, shipments, tracking
│   │   │   └── index.ts
│   │   └── index.ts                # Integration barrel export
│   │
│   ├── storage/                    # File storage abstraction
│   │   ├── base.storage.ts         # Abstract StorageService class
│   │   ├── local.storage.ts        # Local filesystem implementation
│   │   ├── s3.storage.ts           # AWS S3 implementation
│   │   └── index.ts                # Factory pattern (auto-selects by STORAGE_DRIVER)
│   │
│   ├── queues/                     # BullMQ job queue setup
│   │   ├── queue.factory.ts        # Queue singleton registry
│   │   ├── producers/              # Job enqueuing
│   │   │   ├── shipment.producer.ts
│   │   │   └── email.producer.ts
│   │   ├── consumers/              # Job processing (Workers)
│   │   │   ├── shipment.consumer.ts
│   │   │   └── email.consumer.ts
│   │   └── index.ts                # Queues barrel export
│   │
│   ├── workers/                    # Background job worker process
│   │   └── worker.bootstrap.ts     # Worker process entry point
│   │
│   ├── jobs/                       # Scheduled/recurring jobs
│   │   └── job.scheduler.ts        # Cron job registration
│   │
│   ├── events/                     # Event-driven architecture
│   │   ├── event-emitter.ts        # Node EventEmitter + event constants
│   │   ├── handlers/               # Event handlers
│   │   │   └── shipment.handler.ts # Shipment event listeners
│   │   └── index.ts                # Event registration barrel export
│   │
│   ├── common/                     # Shared utilities & patterns
│   │   ├── exceptions/             # Custom HTTP exceptions
│   │   │   └── app.exception.ts    # AppException + typed subclasses
│   │   ├── middlewares/            # Express middlewares
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── request-logger.middleware.ts
│   │   │   ├── rate-limiter.middleware.ts
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   └── validate.middleware.ts  # Zod schema validation
│   │   ├── helpers/                # Utility functions
│   │   │   ├── logger.ts           # Winston logger instance
│   │   │   └── api-response.helper.ts  # Standardized API responses
│   │   ├── constants/              # App-wide constants
│   │   │   └── index.ts            # HTTP_STATUS, pagination defaults
│   │   ├── types/                  # TypeScript type definitions
│   │   │   └── index.ts            # Pagination, utility types
│   │   ├── decorators/             # Custom decorators (for future use)
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── enums/                  # TypeScript enums
│   │   ├── guards/                 # Route guards (for future use)
│   │   ├── interfaces/             # TypeScript interfaces
│   │   └── validators/             # Validation schemas (Zod)
│   │
│   ├── controllers/                # HTTP request handlers
│   │   └── [feature]/              # Feature-based folders
│   │
│   ├── services/                   # Business logic
│   │   └── [feature]/              # Feature-based folders
│   │
│   └── routes/v1/                  # API routes
│       └── index.ts                # V1 route registry
│
└── tests/                          # Test suites
    ├── setup.ts                    # Jest global setup/teardown
    ├── helpers/
    │   ├── request.helper.ts       # Supertest wrapper + auth helpers
    │   └── db.helper.ts            # Database helpers (truncate, etc.)
    ├── fixtures/                   # Test data fixtures
    ├── unit/                       # Unit tests
    ├── integration/                # Integration tests
    └── e2e/                        # End-to-end tests
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Key variables to update:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nepex_cargo
DB_USER=postgres
DB_PASSWORD=your_password

# Auth
JWT_SECRET=your-secret-key-change-in-production

# Storage
STORAGE_DRIVER=local  # or "s3" for AWS S3

# Third-party APIs (leave empty if not using)
STRIPE_SECRET_KEY=sk_test_...
UPS_CLIENT_ID=...
FEDEX_API_KEY=...
DHL_API_KEY=...
```

### 4. Database Setup

**Run migrations:**
```bash
npm run migration:run
```

**Create a new migration:**
```bash
npm run migration:generate -- -n CreateUsersTable
```

**Revert last migration:**
```bash
npm run migration:revert
```

### 5. Seed Database (Optional)

```bash
npm run seed
```

Seeders are **idempotent** — they track which seeders have run and skip them on subsequent runs. Seeder metadata is stored in the `typeorm_seeders` table.

---

## Running the Project

### Development (API Server)

```bash
npm run dev
```

Server starts on `http://localhost:3000`  
Auto-reloads on file changes via Nodemon.

**Health check endpoint:**
```bash
curl http://localhost:3000/health
```

### Background Workers (In Separate Process)

```bash
npm run worker
```

This runs the standalone worker process that processes jobs from BullMQ queues:
- Email jobs
- Shipment processing
- Payment handling
- Reports

In production, run the worker as a separate service/container.

### Production Build

```bash
npm run build
npm start
```

Outputs compiled code to `dist/` directory.

---

## Available NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run worker` | Start background job worker |
| `npm run seed` | Run database seeders (idempotent) |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate` | Generate new migration from entity changes |
| `npm run migration:show` | Show pending migrations |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run e2e tests only |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run typecheck` | Type-check without emitting (fast) |

---

## Key Concepts

### Database Migrations & Seeders

**Migrations** track schema changes over time. Create a new migration:

```bash
npm run migration:generate -- -n AddStatusToShipments
```

This generates a new file in `src/database/migrations/` that you edit and then run:

```bash
npm run migration:run
```

**Seeders** populate initial/reference data idempotently. Create a new seeder in `src/database/seeders/` and register it in `src/database/seeders/index.ts`:

```typescript
import { roleSeeder } from './001-roles.seeder';

const seeders = [
  { name: '001-roles', run: roleSeeder },
];
```

Seeders track execution in the `typeorm_seeders` table, so they run exactly once.

### Storage Abstraction

The `StorageService` abstracts file operations. Pick your driver via `STORAGE_DRIVER` env var:

```typescript
import { getStorageService } from '@storage';

const storage = getStorageService(); // Returns LocalStorageService or S3StorageService
await storage.upload(file, 'documents');
await storage.getSignedUrl(key);
```

### Queues & Background Workers

Use **BullMQ** for async job processing:

```typescript
import { shipmentProducer } from '@queues';

// Enqueue a job
await shipmentProducer.enqueueRateCheck({
  shipmentId: '123',
  carrier: 'ups',
});
```

The **worker process** listens and processes jobs:

```bash
npm run worker
```

Workers are defined in `src/queues/consumers/`.

### Third-party Integrations

Each integration has a **client** (low-level API calls) and **service** (business logic):

```typescript
import { StripeService } from '@integrations/stripe';

const stripe = new StripeService();
const intent = await stripe.createPaymentIntent(9999, 'usd');
```

### Events

Use Node's `EventEmitter` for event-driven flows:

```typescript
import { appEvents, APP_EVENTS } from '@events';

// Emit an event
appEvents.emit(APP_EVENTS.SHIPMENT_CREATED, { shipmentId: '123', email: 'user@example.com' });

// Listen in handler
appEvents.on(APP_EVENTS.SHIPMENT_CREATED, async (payload) => {
  // Send email, log, etc.
});
```

Register all handlers early in your app (e.g., in `server.ts`):

```typescript
import { registerAllHandlers } from '@events';
registerAllHandlers();
```

### Validation

Use **Zod** for request validation:

```typescript
import { z } from 'zod';
import { validate } from '@common/middlewares/validate.middleware';

const createShipmentSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  weight: z.number().positive(),
});

router.post('/shipments', 
  validate(createShipmentSchema, 'body'),
  createShipmentController
);
```

### Error Handling

Throw typed HTTP exceptions:

```typescript
import { NotFoundException, BadRequestException } from '@common/exceptions';

if (!shipment) {
  throw new NotFoundException('Shipment');
}

if (weight <= 0) {
  throw new BadRequestException('Weight must be positive', { weight });
}
```

The error handler middleware catches them and responds with appropriate status codes.

### Logging

Use the Winston logger:

```typescript
import { logger } from '@common/helpers/logger';

logger.info('Shipment created', { id: shipment.id });
logger.error('Payment failed', error);
```

Logs are colorized in dev, JSON in production.

---

## TypeScript Path Aliases

Imports are simplified via path aliases in `tsconfig.json`:

```typescript
// Instead of:
import { logger } from '../../common/helpers/logger';

// Use:
import { logger } from '@common/helpers/logger';
```

**Available aliases:**
- `@config/*` → `src/config/`
- `@common/*` → `src/common/`
- `@controllers/*` → `src/controllers/`
- `@services/*` → `src/services/`
- `@database/*` → `src/database/`
- `@integrations/*` → `src/integrations/`
- `@queues/*` → `src/queues/`
- `@storage/*` → `src/storage/`

---

## Testing

### Write Tests

Create test files matching the `*.test.ts` pattern in `tests/`:

```typescript
// tests/unit/services/shipment.service.test.ts
import { ShipmentService } from '@services/shipment';

describe('ShipmentService', () => {
  it('should calculate rates', async () => {
    const service = new ShipmentService();
    const rates = await service.getRates({...});
    expect(rates).toBeDefined();
  });
});
```

### Run Tests

```bash
npm test                 # All tests
npm run test:unit       # Unit tests only
npm run test:coverage   # With coverage report
```

Database setup/teardown is handled in `tests/setup.ts`.

---

## Architecture Patterns

### Feature Folders

Organize by feature (not by layer):

```
src/
├── controllers/
│   └── shipment/           # All shipment-related controllers
├── services/
│   └── shipment/           # All shipment-related services
└── routes/v1/
    └── shipment.routes.ts  # Shipment API routes
```

### Dependency Injection

Keep it simple — inject services manually or use a DI container like `tsyringe` if needed.

### Error Flow

```
Request → Middleware → Controller → Service → Database
                                         ↓
                             Throw AppException
                                         ↓
                          Error Handler Middleware
                                         ↓
                               Standardized Response
```

---

## Troubleshooting

**"Cannot find module" errors:**
- Check that TypeScript paths in `tsconfig.json` match your folder names
- Run `npm run typecheck` to validate

**Database migrations failed:**
- Ensure PostgreSQL is running
- Check `DB_*` env vars
- Check migration syntax (TypeORM docs)

**Queue jobs stuck:**
- Check Redis is running and accessible
- Check worker logs for errors
- Verify job data serializable (no functions, circular refs)

**TypeScript build errors:**
- Run `npm run typecheck` for detailed errors
- Ensure all dependencies have `@types/*` packages

---

## Production Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Set environment variables** (use secrets manager):
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   DB_HOST=prod-db.example.com
   ```

3. **Run migrations:**
   ```bash
   npm run migration:run
   ```

4. **Start the API server:**
   ```bash
   npm start
   ```

5. **Run worker(s) in separate process(es):**
   ```bash
   npm run worker
   ```

6. **Optional: Seed initial data:**
   ```bash
   npm run seed
   ```

Use process managers like **PM2**, **systemd**, or **Docker** to manage long-running processes.

---

## Next Steps

1. Create database entities in `src/database/entities/`
2. Generate migrations: `npm run migration:generate`
3. Add controllers in `src/controllers/`
4. Add services in `src/services/`
5. Mount routes in `src/routes/v1/index.ts`
6. Write tests in `tests/`
7. Add event handlers as needed in `src/events/handlers/`

Good luck! 🚀
