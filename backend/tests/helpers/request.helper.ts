import request from 'supertest';
import { app } from '../../app';

export const api = request(app);

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
