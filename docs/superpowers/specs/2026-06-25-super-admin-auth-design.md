# Super Admin Auth — Design Spec

**Date:** 2026-06-25
**Scope:** Auth only (login, me, create admin). Future capabilities noted in controller comments.

---

## 1. Context

The platform is multi-tenant. The existing `users` table holds **tenant users** (customers). Super admins are **platform operators** — a fundamentally different identity that must never share auth surface with tenant users.

## 2. Decision: Approach A — Separate entity + dedicated JWT claim

- `super_admins` table, completely separate from `users`
- JWT carries `{ sub: id, type: 'super_admin' }` — the `type` claim makes it impossible to use a tenant user token on admin routes and vice versa
- Dedicated `checkSuperAdmin()` middleware, no coupling to `checkPermission()`
- No public registration endpoint — first admin is seeded from env vars, additional admins are created by an existing super admin via a protected internal endpoint

---

## 3. Database

### `super_admins` table

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| `id`          | UUID         | PK, `uuid_generate_v4()` |
| `email`       | varchar(255) | unique, not null         |
| `password`    | varchar      | bcrypt hashed, not null  |
| `firstName`   | varchar(100) | nullable                 |
| `lastName`    | varchar(100) | nullable                 |
| `status`      | varchar(30)  | default `active`         |
| `lastLoginAt` | timestamp    | nullable                 |
| `lastLoginIp` | varchar(45)  | nullable (IPv4 + IPv6)   |
| `createdAt`   | timestamp    | `CURRENT_TIMESTAMP`      |
| `updatedAt`   | timestamp    | `CURRENT_TIMESTAMP`      |

**Status values:** `active` | `inactive` | `suspended`

**Migration:** single migration file following the project's 15-digit UTC timestamp convention.

### Seeder

- Name: `004-super-admin`
- Reads `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from env
- Idempotent — skips if email already exists
- Registered in `seeders/index.ts` after the existing three seeders

---

## 4. Auth Flow

### Endpoints

All routes mounted at `/api/v1/admin`.

| Method | Path           | Auth             | Description                              |
|--------|----------------|------------------|------------------------------------------|
| POST   | `/auth/login`  | public           | email + password → JWT                   |
| GET    | `/auth/me`     | super admin token | return own profile (no password)        |
| POST   | `/auth/create` | super admin token | create another super admin (internal)   |

### JWT

```
{ sub: "<super_admin_id>", type: "super_admin" }
```

- Signed with the same `JWT_SECRET` env var
- Expiry from `JWT_EXPIRES_IN` env var (default `7d`)
- The `type: 'super_admin'` claim is the hard guard — middleware rejects any token missing it

### Middleware: `checkSuperAdmin()`

Located at `src/common/middlewares/super-admin-auth.middleware.ts`.

1. Extract Bearer token from `Authorization` header
2. Verify signature with `JWT_SECRET`
3. Assert `decoded.type === 'super_admin'` — reject with 401 if missing or wrong
4. Fetch super admin from DB by `decoded.sub` — reject with 401 if not found or not `active`
5. Attach to `req.superAdmin`
6. Call `next()`

Extends Express `Request` type: `req.superAdmin?: SuperAdmin`.

---

## 5. DTOs (Zod)

**`loginSuperAdminSchema`**
```ts
{ email: z.string().email(), password: z.string() }
```

**`createSuperAdminSchema`**
```ts
{
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}
```

---

## 6. Service: `SuperAdminService`

| Method          | Description                                                        |
|-----------------|--------------------------------------------------------------------|
| `login()`       | find by email, bcrypt compare, update `lastLoginAt` + `lastLoginIp`, return admin |
| `getById()`     | find by id, throw `NotFoundException` if missing                   |
| `createAdmin()` | check email uniqueness, hash password, save                        |

Exported as singleton `superAdminService`.

---

## 7. Controller: `super-admin.controller.ts`

Three handler functions: `login`, `me`, `createAdmin`.

Top of file carries a comment block listing future capabilities:
- Tenant management (create, view, update, suspend tenants)
- Plan management (create and manage subscription plans)
- User oversight (view users across all tenants)
- Platform settings (manage global configs — countries, currencies, etc.)

---

## 8. File Map

```
src/
├── database/
│   ├── entities/
│   │   └── super-admin.entity.ts
│   ├── migrations/
│   │   └── <timestamp>-CreateSuperAdmins.ts
│   ├── repositories/
│   │   └── super-admin.repository.ts
│   └── seeders/
│       └── super-admin.seeder.ts
│
├── services/
│   └── super-admin.service.ts
│
├── controllers/
│   └── super-admin.controller.ts
│
├── routes/v1/
│   └── super-admin.routes.ts
│
└── common/
    ├── dto/
    │   └── super-admin.dto.ts
    └── middlewares/
        └── super-admin-auth.middleware.ts
```

**Also updated:**
- `src/database/entities/index.ts` — export `SuperAdmin`
- `src/database/repositories/index.ts` — export `superAdminRepository`
- `src/database/seeders/index.ts` — register `superAdminSeeder`
- `src/routes/v1/index.ts` — mount super admin routes at `/admin`
- `src/config/env.config.ts` — add `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`
- `env.example` — document the two new vars

---

## 9. Env Vars Added

| Var                    | Required | Notes                          |
|------------------------|----------|--------------------------------|
| `SUPER_ADMIN_EMAIL`    | yes      | used by seeder only            |
| `SUPER_ADMIN_PASSWORD` | yes      | min 8 chars, seeder hashes it  |
