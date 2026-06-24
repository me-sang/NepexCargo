// eslint-disable-next-line @typescript-eslint/naming-convention -- SDK default export
import Stripe from 'stripe';
import { StripeClient } from './stripe.client';

/**
 * Payment operations backed by Stripe. The client is injected by the caller
 * (`new StripeService(stripeClient)`) — no `req`/`res`, no `env` access.
 */
export class StripeService {
  constructor(private readonly client: StripeClient) {}

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Stripe.MetadataParam,
  ): Promise<Stripe.PaymentIntent> {
    return this.client.sdk.paymentIntents.create({ amount, currency, metadata });
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.client.sdk.paymentIntents.confirm(paymentIntentId);
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.client.sdk.customers.create({ email, name });
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    return this.client.sdk.webhooks.constructEventAsync(
      payload,
      signature,
      this.client.webhookSecret,
    );
  }

  async refund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return this.client.sdk.refunds.create({
      // eslint-disable-next-line camelcase -- Stripe API wire field name
      payment_intent: paymentIntentId,
      amount,
    });
  }
}
