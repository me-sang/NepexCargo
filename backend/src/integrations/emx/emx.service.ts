import { EmxClient } from './emx.client';
import {
  EmxCancelShipmentResponse,
  EmxCreateShipmentRequest,
  EmxCreateShipmentResponse,
  EmxPrintLabelResponse,
  EmxTrackingResponse,
} from './emx.types';

/**
 * Typed wrapper over the four EMX (Emirates Post) endpoints. The client is
 * injected by the caller (`new EmxService(emxClient)`) — no `req`/`res` here.
 */
export class EmxService {
  constructor(private readonly client: EmxClient) {}

  /** Create a shipment and return the booking (AWB number + base64 label). */
  async createShipment(payload: EmxCreateShipmentRequest): Promise<EmxCreateShipmentResponse> {
    return this.client.postShipments<EmxCreateShipmentResponse>('/api/Shipments/create', payload);
  }

  /** Cancel a previously created shipment by its AWB number. */
  async cancelShipment(awb: string): Promise<EmxCancelShipmentResponse> {
    return this.client.postShipments<EmxCancelShipmentResponse>(
      '/api/Shipments/cancel',
      undefined,
      { awb },
    );
  }

  /** Fetch the printable air-waybill label for an AWB number. */
  async printLabel(awb: string): Promise<EmxPrintLabelResponse> {
    return this.client.getShipments<EmxPrintLabelResponse>('/api/label/print', { awb });
  }

  /** Track a shipment by its AWB number. */
  async trackShipment(awbNumber: string): Promise<EmxTrackingResponse> {
    return this.client.getTracking<EmxTrackingResponse>('/api/Tracking', { awbNumber });
  }
}
