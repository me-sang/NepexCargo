import { AppDataSource } from '@database/data-source';
import { Plan, PlanFeature } from '@database/entities';
import { planRepository } from '@database/repositories';
import { NotFoundException, ConflictException } from '@common/exceptions/app.exception';
import type { CreatePlanDTO, UpdatePlanDTO } from '@common/dto/plan.dto';

export class PlanService {
  private planRepo = AppDataSource.getRepository(Plan);

  async listPlans(): Promise<Plan[]> {
    return planRepository.find({
      relations: ['features'],
      order: { sortOrder: 'ASC' },
    });
  }

  async getPlan(id: string): Promise<Plan> {
    const plan = await planRepository.findWithFeatures(id);
    if (!plan) throw new NotFoundException('Plan');
    return plan;
  }

  async createPlan(data: CreatePlanDTO): Promise<Plan> {
    let createdId!: string;

    await AppDataSource.transaction(async (em) => {
      const planRepo = em.getRepository(Plan);
      const featureRepo = em.getRepository(PlanFeature);

      const existing = await planRepo.findOne({ where: { code: data.code } });
      if (existing) throw new ConflictException('Plan code already in use');

      const { features, ...planFields } = data;
      const plan = planRepo.create(planFields);
      const saved = await planRepo.save(plan);
      createdId = saved.id;

      if (features.length > 0) {
        const featureEntities = features.map((f) =>
          featureRepo.create({ ...f, planId: saved.id }),
        );
        await featureRepo.save(featureEntities);
      }
    });

    return this.getPlan(createdId);
  }

  async updatePlan(id: string, data: UpdatePlanDTO): Promise<Plan> {
    const plan = await this.getPlan(id);

    await AppDataSource.transaction(async (em) => {
      const planRepo = em.getRepository(Plan);
      const featureRepo = em.getRepository(PlanFeature);

      if (data.code && data.code !== plan.code) {
        const conflict = await planRepo.findOne({ where: { code: data.code } });
        if (conflict) throw new ConflictException('Plan code already in use');
      }

      const { features, ...planFields } = data;
      Object.assign(plan, planFields);
      await planRepo.save(plan);

      if (features !== undefined) {
        await featureRepo.delete({ planId: id });
        if (features.length > 0) {
          const featureEntities = features.map((f) =>
            featureRepo.create({ ...f, planId: id }),
          );
          await featureRepo.save(featureEntities);
        }
      }
    });

    return this.getPlan(id);
  }

  async deletePlan(id: string): Promise<Plan> {
    const plan = await this.getPlan(id);
    plan.isActive = false;
    await this.planRepo.save(plan);
    return this.getPlan(id);
  }
}

export const planService = new PlanService();
