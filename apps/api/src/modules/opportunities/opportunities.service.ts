import { Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ChangeOpportunityStageDto } from './dto/change-stage.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccount(companyId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({ where: { id: accountId, companyId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async create(companyId: string, dto: CreateOpportunityDto) {
    await this.ensureAccount(companyId, dto.accountId);

    if (dto.ownerId) {
      const owner = await this.prisma.user.findFirst({ where: { id: dto.ownerId, companyId } });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
    }

    return this.prisma.opportunity.create({
      data: {
        companyId,
        accountId: dto.accountId,
        ownerId: dto.ownerId,
        title: dto.title,
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        stage: dto.stage ?? OpportunityStage.PREPARACION,
        probability: dto.probability,
        expectedCloseAt: dto.expectedCloseAt,
      },
    });
  }

  async findAll(companyId: string, query: ListOpportunitiesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OpportunityWhereInput = {
      companyId,
    };

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = query.from;
      }
      if (query.to) {
        where.createdAt.lte = query.to;
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.opportunity.count({ where }),
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, name: true } },
          owner: { select: { id: true, email: true } },
        },
      }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(companyId: string, id: string) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, companyId },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, email: true } },
      },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  async update(companyId: string, id: string, dto: UpdateOpportunityDto) {
    const existing = await this.findOne(companyId, id);

    if (dto.accountId && dto.accountId !== existing.accountId) {
      await this.ensureAccount(companyId, dto.accountId);
    }

    if (dto.ownerId && dto.ownerId !== existing.ownerId) {
      const owner = await this.prisma.user.findFirst({ where: { id: dto.ownerId, companyId } });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
    }

    const data: Prisma.OpportunityUncheckedUpdateInput = {
      accountId: dto.accountId,
      ownerId: dto.ownerId,
      title: dto.title,
      description: dto.description,
      amount: dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
      probability: dto.probability,
      expectedCloseAt: dto.expectedCloseAt,
    };

    Object.keys(data).forEach((key) => {
      if ((data as Record<string, unknown>)[key] === undefined) {
        delete (data as Record<string, unknown>)[key];
      }
    });

    return this.prisma.opportunity.update({ where: { id }, data });
  }

  async changeStage(companyId: string, userId: string, id: string, dto: ChangeOpportunityStageDto) {
    const opportunity = await this.prisma.opportunity.findFirst({ where: { id, companyId } });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.stage === dto.newStage) {
      return opportunity;
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.opportunity.update({
        where: { id },
        data: {
          stage: dto.newStage,
          closedAt:
            dto.newStage === OpportunityStage.VENTA || dto.newStage === OpportunityStage.NO_VENTA
              ? new Date()
              : opportunity.closedAt,
        },
      });

      await tx.stageChange.create({
        data: {
          companyId,
          opportunityId: id,
          oldStage: opportunity.stage,
          newStage: dto.newStage,
          reason: dto.reason,
          changedById: userId,
        },
      });

      return updated;
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.opportunity.delete({ where: { id } });
    return { success: true };
  }
}
