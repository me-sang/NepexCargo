import { DhlClient } from './dhl.client';

export class DhlService {
  private client = new DhlClient();

  async trackShipment(trackingNumber: string): Promise<unknown> {
    return this.client.get('/track/shipments', { trackingNumber });
  }

  async getRates(payload: unknown): Promise<unknown> {
    return this.client.post('/mydhl-api/rates', payload);
  }

  async createShipment(payload: unknown): Promise<unknown> {
    return this.client.post('/mydhl-api/shipments', payload);
  }
}
