import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.config';

const BASE_URL = env.DHL_SANDBOX ? 'https://api-mock.dhl.com' : 'https://api.dhl.com';

export class DhlClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: BASE_URL,
      headers: { 'DHL-API-Key': env.DHL_API_KEY },
    });
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.http.get<T>(path, { params });
    return res.data;
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await this.http.post<T>(path, data);
    return res.data;
  }
}
