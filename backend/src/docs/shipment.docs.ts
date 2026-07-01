import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { WeightUnit } from '@common/enums/rate.enums';

const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });
const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });

const ZoneRef = z.object({ id: z.string().uuid(), name: z.string() });

const TierResult = z.object({
  minWeight: z.number(),
  maxWeight: z.number().nullable(),
  price: z.number().describe('Bracket price from the rate card'),
  flatPrice: z.number().nullable(),
  total: z.number().describe('price + flatPrice'),
});

const IntegrationRef = z.object({
  id: z.string().uuid(),
  name: z.string(),
  logoUrl: z.string().nullable(),
});

const RateOption = registry.register(
  'RateOption',
  z.object({
    rateCardId: z.string().uuid(),
    name: z.string().nullable().describe('e.g. DOX, WPX'),
    currency: z.string().length(3),
    weightUnit: z.nativeEnum(WeightUnit),
    chargeableWeight: z.number().describe('Input weight converted to the rate card unit'),
    destinationZone: ZoneRef,
    integration: IntegrationRef.nullable().describe('Courier integration linked to this rate card'),
    tier: TierResult.nullable().describe('null when weight exceeds all defined tiers'),
  }),
);

const CheckRatesResponse = registry.register(
  'CheckRatesResponse',
  z.object({
    sourceCountry: z.string().length(2),
    destinationCountry: z.string().length(2),
    destinationZone: ZoneRef.nullable().describe('null when no zone is configured for the destination'),
    inputWeight: z.number(),
    inputWeightUnit: z.nativeEnum(WeightUnit),
    rates: z.array(RateOption),
  }),
);

registry.registerPath({
  method: 'post',
  path: '/shipment/international/check-rates',
  tags: ['Shipment — International'],
  summary: 'Check available rates for an international shipment',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            minWeight: z.number().positive().describe('Weight of the shipment'),
            weightUnit: z.nativeEnum(WeightUnit).describe('Unit of the provided weight'),
            sourceLocation: z.string().length(2).describe('Origin country ISO2 code'),
            destinationLocation: z.string().length(2).describe('Destination country ISO2 code'),
            locationType: z.literal('country'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Rate check result. rates[] is empty when no configured route matches.',
      content: { 'application/json': { schema: SuccessData(CheckRatesResponse) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
