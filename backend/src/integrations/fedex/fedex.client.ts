import axios, { AxiosInstance } from 'axios';

/**
 * Integration-specific config consumed by {@link FedexClient}. Produced by the
 * shipment normalizer (which resolves the sandbox/production host) — the client
 * does not read `env`.
 */
export interface FedexClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  accountNumber: string;
}

export class FedexClient {
  /** Exposed so the service can reference the billing account on requests. */
  readonly accountNumber: string;

  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: FedexClientConfig) {
    this.accountNumber = config.accountNumber;
    this.http = axios.create({ baseURL: config.baseUrl });
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const params = new URLSearchParams({
      /* eslint-disable camelcase -- FedEx OAuth wire field names */
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      /* eslint-enable camelcase */
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention -- FedEx OAuth wire field names
    const res = await axios.post<{ access_token: string; expires_in: number }>(
      `${this.config.baseUrl}/oauth/token`,
      params,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP header name
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    this.accessToken = res.data.access_token;
    this.tokenExpiry = Date.now() + res.data.expires_in * 1000 - 60_000;
    return this.accessToken;
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const token = await this.getToken();
    const res = await this.http.post<T>(path, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
}
