import { UpsClient } from './ups.client';

export interface UpsRateRequest {
  originPostalCode: string;
  destinationPostalCode: string;
  weight: number;
  weightUnit?: 'LBS' | 'KGS';
}

export interface UpsShipRequest {
  shipper: {
    name: string;
    address: string;
    postalCode: string;
    countryCode: string;
  };
  recipient: {
    name: string;
    address: string;
    postalCode: string;
    countryCode: string;
  };
  weight: number;
  serviceCode: string;
}

export class UpsService {
  private client = new UpsClient();

  async getRates(request: UpsRateRequest): Promise<unknown> {
    return this.client.post('/rating/v2403/rate', {
      RateRequest: {
        Request: { RequestOption: 'Rate' },
        Shipment: {
          Shipper: { Address: { PostalCode: request.originPostalCode } },
          ShipTo: { Address: { PostalCode: request.destinationPostalCode } },
          Package: {
            PackagingType: { Code: '02' },
            PackageWeight: {
              UnitOfMeasurement: { Code: request.weightUnit ?? 'LBS' },
              Weight: String(request.weight),
            },
          },
        },
      },
    });
  }

  async createShipment(request: UpsShipRequest): Promise<unknown> {
    return this.client.post('/shipments/v2403/ship', request);
  }

  async trackShipment(trackingNumber: string): Promise<unknown> {
    return this.client.post('/track/v1/details', { trackingNumber });
  }
}
