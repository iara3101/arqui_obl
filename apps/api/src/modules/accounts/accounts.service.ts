import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(companyId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        website: dto.website,
        industry: dto.industry,
        phone: dto.phone,
      },
    });
  }

  async findAll(companyId: string, query: ListAccountsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {
      companyId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { industry: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(companyId: string, id: string) {
    const account = await this.prisma.account.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(companyId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(companyId, id);
    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.account.delete({ where: { id } });
    return { success: true };
  }
}
