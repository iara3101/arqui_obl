import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateOpportunityStageDto } from './dto/update-opportunity-stage.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, payload: CreateOpportunityDto) {
    return this.prisma.opportunity.create({
      data: {
        ...payload,
        amount: new Prisma.Decimal(payload.amount),
        companyId,
        stage: payload.stage,
        closeDate: payload.closeDate ? new Date(payload.closeDate) : undefined,
      },
    });
  }

  async list(
    companyId: string,
    query?: { stage?: string; accountId?: string; from?: string; to?: string },
  ) {
    const where: Prisma.OpportunityWhereInput = { companyId };
    if (query?.stage) {
      where.stage = query.stage as any;
    }
    if (query?.accountId) {
      where.accountId = query.accountId;
    }
    if (query?.from || query?.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }
    return this.prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(companyId: string, id: string) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, companyId },
      include: {
        stageChanges: true,
        attachments: true,
      },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  async update(companyId: string, id: string, payload: UpdateOpportunityDto) {
    const updateResult = await this.prisma.opportunity.updateMany({
      where: { id, companyId },
      data: {
        ...payload,
        amount: payload.amount ? new Prisma.Decimal(payload.amount) : undefined,
        closeDate: payload.closeDate ? new Date(payload.closeDate) : undefined,
      },
    });
    if (updateResult.count === 0) {
      throw new NotFoundException('Opportunity not found');
    }
    return this.prisma.opportunity.findFirstOrThrow({
      where: { id, companyId },
    });
  }

  async updateStage(
    companyId: string,
    id: string,
    userId: string,
    payload: UpdateOpportunityStageDto,
  ) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, companyId },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    if (opportunity.stage === payload.newStage) {
      throw new BadRequestException('Opportunity already in target stage');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.stageChange.create({
        data: {
          companyId,
          opportunityId: id,
          oldStage: opportunity.stage,
          newStage: payload.newStage,
          reason: payload.reason,
          changedById: userId,
        },
      });
      return tx.opportunity.update({
        where: { id },
        data: {
          stage: payload.newStage,
        },
      });
    });
  }

  async delete(companyId: string, id: string) {
    const result = await this.prisma.opportunity.deleteMany({
      where: { id, companyId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Opportunity not found');
    }
    return { message: 'Opportunity deleted' };
  }
}
