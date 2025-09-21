import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class StageChangesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    companyId: string,
    query?: { stage?: string; from?: string; to?: string },
  ) {
    const where: Prisma.StageChangeWhereInput = {
      companyId,
    };
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
            accountId: true,
          },
        },
      },
    });
  }
}
