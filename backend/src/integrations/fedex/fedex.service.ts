import { FedexClient } from './fedex.client';
import { env } from '../../config/env.config';

export class FedexService {
  private client = new FedexClient();

  async getRates(payload: {
    originPostalCode: string;
    destinationPostalCode: string;
    weight: number;
  }): Promise<unknown> {
    return this.client.post('/rate/v1/rates/quotes', {
      accountNumber: { value: env.FEDEX_ACCOUNT_NUMBER },
      requestedShipment: {
        shipper: { address: { postalCode: payload.originPostalCode, countryCode: 'US' } },
        recipient: { address: { postalCode: payload.destinationPostalCode, countryCode: 'US' } },
        pickupType: 'USE_SCHEDULED_PICKUP',
        requestedPackageLineItems: [{ weight: { units: 'LB', value: payload.weight } }],
      },
    });
  }

  async createShipment(payload: unknown): Promise<unknown> {
    return this.client.post('/ship/v1/shipments', payload);
  }

  async trackShipment(trackingNumber: string): Promise<unknown> {
    return this.client.post('/track/v1/trackingnumbers', {
      trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
    });
  }
}
