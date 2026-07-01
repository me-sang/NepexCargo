import { AppDataSource } from '@database/data-source';
import { Zone, RateCard, WeightTier } from '@database/entities';
import { NotFoundException } from '@common/exceptions/app.exception';
import type {
  CreateZoneDTO,
  UpdateZoneDTO,
  CreateRateCardDTO,
  UpdateRateCardDTO,
} from '@common/dto/rate.dto';

export class RateManagementService {
  private zoneRepo = AppDataSource.getRepository(Zone);
  private rateCardRepo = AppDataSource.getRepository(RateCard);
  private weightTierRepo = AppDataSource.getRepository(WeightTier);

  // ── Zones ───────────────────────────────────────────────────────────────────

  async listZones(tenantId: string): Promise<Zone[]> {
    return this.zoneRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getZone(tenantId: string, id: string): Promise<Zone> {
    const zone = await this.zoneRepo.findOne({ where: { id, tenantId } });
    if (!zone) throw new NotFoundException('Zone');
    return zone;
  }

  async createZone(tenantId: string, data: CreateZoneDTO): Promise<Zone> {
    const zone = this.zoneRepo.create({ ...data, tenantId });
    return this.zoneRepo.save(zone);
  }

  async updateZone(tenantId: string, id: string, data: UpdateZoneDTO): Promise<Zone> {
    const zone = await this.getZone(tenantId, id);
    Object.assign(zone, data);
    return this.zoneRepo.save(zone);
  }

  async deleteZone(tenantId: string, id: string): Promise<void> {
    const zone = await this.getZone(tenantId, id);
    await this.zoneRepo.remove(zone);
  }

  // ── Rate Cards ──────────────────────────────────────────────────────────────

  async listRateCards(tenantId: string): Promise<RateCard[]> {
    return this.rateCardRepo.find({
      where: { tenantId },
      relations: ['weightTiers', 'originZone', 'destinationZone'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRateCard(tenantId: string, id: string): Promise<RateCard> {
    const card = await this.rateCardRepo.findOne({
      where: { id, tenantId },
      relations: ['weightTiers', 'originZone', 'destinationZone'],
    });
    if (!card) throw new NotFoundException('Rate card');
    return card;
  }

  async createRateCard(tenantId: string, data: CreateRateCardDTO): Promise<RateCard> {
    let createdId!: string;

    await AppDataSource.transaction(async (em) => {
      const cardRepo = em.getRepository(RateCard);
      const tierRepo = em.getRepository(WeightTier);

      const { weightTiers, ...cardFields } = data;
      const card = cardRepo.create({ ...cardFields, tenantId });
      const saved = await cardRepo.save(card);
      createdId = saved.id;

      if (weightTiers.length > 0) {
        const tiers = weightTiers.map((t) => tierRepo.create({ ...t, rateCardId: saved.id }));
        await tierRepo.save(tiers);
      }
    });

    return this.getRateCard(tenantId, createdId);
  }

  async updateRateCard(
    tenantId: string,
    id: string,
    data: UpdateRateCardDTO,
  ): Promise<RateCard> {
    await this.getRateCard(tenantId, id);

    await AppDataSource.transaction(async (em) => {
      const cardRepo = em.getRepository(RateCard);
      const tierRepo = em.getRepository(WeightTier);

      const { weightTiers, ...cardFields } = data;
      await cardRepo.update({ id, tenantId }, cardFields);

      if (weightTiers !== undefined) {
        await tierRepo.delete({ rateCardId: id });
        if (weightTiers.length > 0) {
          const tiers = weightTiers.map((t) => tierRepo.create({ ...t, rateCardId: id }));
          await tierRepo.save(tiers);
        }
      }
    });

    return this.getRateCard(tenantId, id);
  }

  async deleteRateCard(tenantId: string, id: string): Promise<void> {
    const card = await this.getRateCard(tenantId, id);
    await this.rateCardRepo.remove(card);
  }
  async getRateCardById(rateCardId: string, attributes?: (keyof RateCard)[]): Promise<RateCard | null> {
    const card = await this.rateCardRepo.findOne({
      where: { id: rateCardId },
      select: attributes ? attributes : undefined,
      relations: ['weightTiers', 'originZone', 'destinationZone'],
    });
    return card;
  }
}

export const rateManagementService = new RateManagementService();
