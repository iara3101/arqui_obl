import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, payload: CreateAccountDto) {
    try {
      return await this.prisma.account.create({
        data: {
          ...payload,
          companyId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Account name must be unique per company');
      }
      throw error;
    }
  }

  async list(
    companyId: string,
    query?: { search?: string; page?: number; size?: number },
  ) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const size = query?.size && query.size > 0 ? query.size : 20;
    const skip = (page - 1) * size;
    const where: Prisma.AccountWhereInput = {
      companyId,
      ...(query?.search
        ? {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.account.count({ where }),
    ]);
    return {
      items,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    };
  }

  async get(companyId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(companyId: string, id: string, payload: UpdateAccountDto) {
    const updateResult = await this.prisma.account
      .updateMany({
        where: { id, companyId },
        data: payload,
      })
      .catch((error) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'Account name must be unique per company',
          );
        }
        throw error;
      });
    if (updateResult.count === 0) {
      throw new NotFoundException('Account not found');
    }
    return this.prisma.account.findFirstOrThrow({
      where: { id, companyId },
    });
  }

  async delete(companyId: string, id: string) {
    const result = await this.prisma.account.deleteMany({
      where: { id, companyId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Account not found');
    }
    return { message: 'Account deleted' };
  }
}
