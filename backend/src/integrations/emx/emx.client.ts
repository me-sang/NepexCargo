import axios, { AxiosInstance } from 'axios';
import { EmxClientConfig } from './emx.types';

/**
 * Low-level HTTP client for the EMX (Emirates Post) API.
 *
 * EMX splits across two hosts with two auth schemes:
 *   - Shipments + label  → `x-api-key` + `Password`
 *   - Tracking           → `AccountNo` + `Password`
 *
 * Config is injected ({@link EmxClientConfig}) by the caller — the client does
 * not read `env`. Two axios instances keep each base URL and header set isolated.
 */
export class EmxClient {
  /** Create / Cancel / Print Label. Authenticated with `x-api-key` + `Password`. */
  private readonly shipmentsHttp: AxiosInstance;
  /** Tracking. Authenticated with `AccountNo` + `Password`. */
  private readonly trackingHttp: AxiosInstance;

  constructor(config: EmxClientConfig) {
    this.shipmentsHttp = axios.create({
      baseURL: config.baseUrl,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'x-api-key': config.apiKey,
        Password: config.password,
      },
    });

    this.trackingHttp = axios.create({
      baseURL: config.trackingBaseUrl,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'Content-Type': 'application/json',
        AccountNo: config.accountNo,
        Password: config.password,
      },
    });
  }

  /** GET against the shipments host. */
  async getShipments<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.shipmentsHttp.get<T>(path, { params });
    return res.data;
  }

  /** POST against the shipments host. */
  async postShipments<T>(
    path: string,
    data?: unknown,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const res = await this.shipmentsHttp.post<T>(path, data, { params });
    return res.data;
  }

  /** GET against the tracking host. */
  async getTracking<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.trackingHttp.get<T>(path, { params });
    return res.data;
  }
}
