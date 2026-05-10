# Nepex Cargo Backend

A professional Node.js + Express backend for cargo/logistics platform with TypeScript, PostgreSQL, Redis, BullMQ, and third-party integrations.

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm 9.0+

### 2. Setup
```bash
# Install pnpm (first time)
npm install -g pnpm

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Setup database
pnpm migration:run
pnpm seed

# Start development server
pnpm dev

# In another terminal: start workers
pnpm worker
```

Server: `http://localhost:3000`  
Health check: `curl http://localhost:3000/health`

## Documentation

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** — Full setup, architecture, pnpm, ESLint, and running the project
- **[CODE_STYLE.md](./CODE_STYLE.md)** — Code style guidelines and naming conventions

## Key Commands

### Development
```bash
pnpm dev              # Start dev server
pnpm worker           # Start background workers
pnpm seed             # Run database seeders
```

### Database
```bash
pnpm migration:run       # Run migrations
pnpm migration:generate  # Generate new migration
pnpm migration:revert    # Revert last migration
```

### Code Quality
```bash
pnpm format:write    # Auto-format code (Prettier)
pnpm format:check    # Check formatting
pnpm lint:fix        # Fix linting issues (ESLint)
pnpm lint:check      # Check for linting issues
pnpm typecheck       # Type-check TypeScript
```

### Testing
```bash
pnpm test            # Run all tests
pnpm test:unit       # Unit tests
pnpm test:coverage   # Coverage report
```

### Build & Run
```bash
pnpm build           # Compile TypeScript
pnpm start           # Run production build
```

## Architecture

```
src/
├── config/           # Environment & connection configs
├── database/         # TypeORM entities, migrations, seeders
├── controllers/      # HTTP request handlers
├── services/         # Business logic
├── routes/           # API route definitions
├── integrations/     # Third-party APIs (Stripe, UPS, FedEx, DHL)
├── storage/          # File storage (Local or S3)
├── queues/           # BullMQ job queues & workers
├── events/           # Event-driven architecture
└── common/           # Shared utilities, exceptions, middlewares
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + TypeORM
- **Cache & Queues**: Redis + BullMQ
- **File Storage**: Local or AWS S3
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Package Manager**: pnpm

## Code Quality

This project enforces:
- ✅ Strict TypeScript (`strict: true`)
- ✅ ESLint for code quality (no unused vars, camelCase naming, etc.)
- ✅ Prettier for consistent formatting
- ✅ Auto-format & auto-fix on save (VS Code)

**Before committing:**
```bash
pnpm format:write && pnpm lint:fix && pnpm typecheck && pnpm test
```

## VS Code Setup

Recommended extensions:
- **Prettier** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

These auto-format and fix code on save. Configuration is in `.vscode/settings.json`.

## Production

```bash
# Build
pnpm build

# Run migrations
pnpm migration:run

# Start server
pnpm start

# Start workers (separate process)
pnpm worker
```

Use Docker, K8s, or your preferred deployment platform.

## Contributing

1. Create a feature branch
2. Write code & tests
3. Run `pnpm format:write && pnpm lint:fix`
4. Commit & push
5. Open a pull request

See [CODE_STYLE.md](./CODE_STYLE.md) for detailed guidelines.

## License

Proprietary — Nepex Cargo
