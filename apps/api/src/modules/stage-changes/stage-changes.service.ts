import { Injectable } from '@nestjs/common';
import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListStageChangesQueryDto } from './dto/list-stage-changes-query.dto';

@Injectable()
export class StageChangesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, query: ListStageChangesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StageChangeWhereInput = {
      companyId,
    };

    if (query.stage) {
      where.newStage = query.stage;
    }

    if (query.opportunityId) {
      where.opportunityId = query.opportunityId;
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

    const [total, data] = await this.prisma.$transaction([
      this.prisma.stageChange.count({ where }),
      this.prisma.stageChange.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changedAt: 'desc' },
        include: {
          opportunity: { select: { id: true, title: true, stage: true } },
          changedBy: { select: { id: true, email: true } },
        },
      }),
    ]);

    return { data, total, page, limit };
  }
}
