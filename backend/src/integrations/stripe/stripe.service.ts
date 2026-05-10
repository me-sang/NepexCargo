import Stripe from 'stripe';
import { stripeClient } from './stripe.client';
import { env } from '../../config/env.config';

export class StripeService {
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Stripe.MetadataParam,
  ): Promise<Stripe.PaymentIntent> {
    return stripeClient.paymentIntents.create({ amount, currency, metadata });
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripeClient.paymentIntents.confirm(paymentIntentId);
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return stripeClient.customers.create({ email, name });
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    return stripeClient.webhooks.constructEventAsync(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  }

  async refund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return stripeClient.refunds.create({ payment_intent: paymentIntentId, amount });
  }
}
