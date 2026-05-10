import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.config';

const BASE_URL = env.UPS_SANDBOX ? 'https://wwwcie.ups.com/api' : 'https://onlinetools.ups.com/api';

export class UpsClient {
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor() {
    this.http = axios.create({ baseURL: BASE_URL });
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const params = new URLSearchParams({ grant_type: 'client_credentials' });
    const res = await axios.post(`${BASE_URL}/security/v1/oauth/token`, params, {
      auth: { username: env.UPS_CLIENT_ID, password: env.UPS_CLIENT_SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    this.accessToken = res.data.access_token;
    this.tokenExpiry = Date.now() + res.data.expires_in * 1000 - 60_000;
    return this.accessToken!;
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const token = await this.getToken();
    const res = await this.http.post<T>(path, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
}
