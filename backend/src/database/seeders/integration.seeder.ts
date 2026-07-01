import { AppDataSource } from '../data-source';
import { Integration } from '../entities/integration.entity';
import { RateCard } from '../entities/rate-card.entity';
import { IntegrationCategory, IntegrationStatus } from '../../common/enums/integration.enums';
import { logger } from '../../common/helpers/logger';

const EMX: Partial<Integration> = {
  name: 'EMX',
  description:
    'EMX is the Courier, Express, and Parcels (CEP) arm of 7X (formerly Emirates Post Group). It provides end-to-end logistics solutions—including same-day delivery, global freight, and e-commerce fulfillment—for governments, banking, and corporate entities across the UAE and global markets.',
  category: IntegrationCategory.COURIER,
  status: IntegrationStatus.ACTIVE,
};

export const integrationSeeder = {
  name: '008-emx-integration',
  run: async (): Promise<void> => {
    const integrationRepo = AppDataSource.getRepository(Integration);
    const rateCardRepo = AppDataSource.getRepository(RateCard);

    let emx = await integrationRepo.findOneBy({ name: EMX.name });
    if (!emx) {
      emx = await integrationRepo.save(integrationRepo.create(EMX));
      logger.info('[Seeder] EMX integration created', { id: emx.id });
    } else {
      logger.info('[Seeder] EMX integration already exists, skipping create');
    }

    const updated = await rateCardRepo.update({ integrationId: null as unknown as string }, { integrationId: emx.id });
    logger.info('[Seeder] Rate cards assigned to EMX', { affected: updated.affected });
  },
};
