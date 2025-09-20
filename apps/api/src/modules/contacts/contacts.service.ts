import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsQueryDto } from './dto/list-contacts-query.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAccount(companyId: string, accountId: string) {
    return this.prisma.account.findFirst({ where: { id: accountId, companyId } });
  }

  async create(companyId: string, dto: CreateContactDto) {
    const account = await this.ensureAccount(companyId, dto.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return this.prisma.contact.create({
      data: {
        companyId,
        accountId: dto.accountId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        title: dto.title,
      },
    });
  }

  async findAll(companyId: string, query: ListContactsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {
      companyId,
    };

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.contact.count({ where }),
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(companyId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, companyId } });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(companyId: string, id: string, dto: UpdateContactDto) {
    const existing = await this.findOne(companyId, id);
    if (dto.accountId && dto.accountId !== existing.accountId) {
      const account = await this.ensureAccount(companyId, dto.accountId);
      if (!account) {
        throw new NotFoundException('Account not found');
      }
    }
    const data = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    ) as Prisma.ContactUpdateInput;
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.contact.delete({ where: { id } });
    return { success: true };
  }
}
