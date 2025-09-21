import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OpportunityStage } from '../../common/enums/opportunity-stage.enum';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async topAccounts(
    companyId: string,
    query?: { limit?: number; from?: string; to?: string },
  ) {
    const where: Prisma.OpportunityWhereInput = {
      companyId,
      stage: OpportunityStage.VENTA,
    };
    if (query?.from || query?.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    const groups = await this.prisma.opportunity.groupBy({
      by: ['accountId'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: query?.limit ?? 3,
    });

    const accounts = await this.prisma.account.findMany({
      where: { id: { in: groups.map((g) => g.accountId) } },
      select: { id: true, name: true },
    });
    const accountMap = new Map(accounts.map((acc) => [acc.id, acc.name]));

    return groups.map((group) => ({
      accountId: group.accountId,
      accountName: accountMap.get(group.accountId) ?? 'Unknown',
      totalAmount: group._sum.amount?.toNumber() ?? 0,
      wins: group._count._all,
    }));
  }

  async stageChanges(
    companyId: string,
    query?: { stage?: string; from?: string; to?: string },
  ) {
    const where: Prisma.StageChangeWhereInput = { companyId };
    if (query?.stage) {
      where.newStage = query.stage as any;
    }
    if (query?.from || query?.to) {
      where.changedAt = {};
      if (query.from) {
        where.changedAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.changedAt.lte = new Date(query.to);
      }
    }
    return this.prisma.stageChange.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
        changedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
