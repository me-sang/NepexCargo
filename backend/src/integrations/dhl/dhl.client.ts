import axios, { AxiosInstance } from 'axios';

/**
 * Integration-specific config consumed by {@link DhlClient}. Produced by the
 * shipment normalizer (which resolves the sandbox/production host) — the client
 * does not read `env`.
 */
export interface DhlClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class DhlClient {
  private http: AxiosInstance;

  constructor(config: DhlClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
      headers: { 'DHL-API-Key': config.apiKey },
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
