import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.config';

/**
 * Low-level HTTP client for the EMX (Emirates Post) API.
 *
 * EMX splits across two hosts with two auth schemes:
 *   - Shipments + label  (`EMX_BASE_URL`)          → `x-api-key` + `Password`
 *   - Tracking           (`EMX_TRACKING_BASE_URL`) → `AccountNo` + `Password`
 *
 * Two axios instances keep each base URL and header set isolated; the service
 * layer ({@link EmxService}) calls the typed helpers below.
 */
export class EmxClient {
  /** Create / Cancel / Print Label. Authenticated with `x-api-key` + `Password`. */
  private readonly shipmentsHttp: AxiosInstance;
  /** Tracking. Authenticated with `AccountNo` + `Password`. */
  private readonly trackingHttp: AxiosInstance;

  constructor() {
    this.shipmentsHttp = axios.create({
      baseURL: env.EMX_BASE_URL,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'x-api-key': env.EMX_API_KEY,
        Password: env.EMX_PASSWORD,
      },
    });

    this.trackingHttp = axios.create({
      baseURL: env.EMX_TRACKING_BASE_URL,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        'Content-Type': 'application/json',
        AccountNo: env.EMX_ACCOUNT_NO,
        Password: env.EMX_PASSWORD,
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
