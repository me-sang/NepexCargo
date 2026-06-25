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
