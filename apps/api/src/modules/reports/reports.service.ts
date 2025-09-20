import { Injectable } from '@nestjs/common';
import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TopAccountsQueryDto } from './dto/top-accounts-query.dto';
import { StageChangesReportQueryDto } from './dto/stage-changes-report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async topAccounts(companyId: string, query: TopAccountsQueryDto) {
    const where: Prisma.OpportunityWhereInput = {
      companyId,
      stage: OpportunityStage.VENTA,
    };

    if (query.from || query.to) {
      where.closedAt = {};
      if (query.from) {
        where.closedAt.gte = query.from;
      }
      if (query.to) {
        where.closedAt.lte = query.to;
      }
    }

    const aggregates = await this.prisma.opportunity.groupBy({
      by: ['accountId'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: query.limit ?? 3,
    });

    const accountIds = aggregates.map((item) => item.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, name: true },
    });
    const accountMap = new Map(accounts.map((acc) => [acc.id, acc.name]));

    return aggregates.map((item) => ({
      accountId: item.accountId,
      accountName: accountMap.get(item.accountId) ?? 'Unknown',
      wins: item._count._all,
      totalAmount: item._sum.amount?.toNumber() ?? 0,
    }));
  }

  async stageChanges(companyId: string, query: StageChangesReportQueryDto) {
    const where: Prisma.StageChangeWhereInput = {
      companyId,
    };

    if (query.stage) {
      where.newStage = query.stage;
    }

    if (query.from || query.to) {
      where.changedAt = {};
      if (query.from) {
        where.changedAt.gte = query.from;
      }
      if (query.to) {
        where.changedAt.lte = query.to;
      }
    }

    return this.prisma.stageChange.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      include: {
        opportunity: { select: { id: true, title: true, stage: true } },
        changedBy: { select: { id: true, email: true } },
      },
    });
  }
}
