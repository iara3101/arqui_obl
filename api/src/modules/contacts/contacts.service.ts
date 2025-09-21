import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, payload: CreateContactDto) {
    try {
      return await this.prisma.contact.create({
        data: {
          ...payload,
          email: payload.email.toLowerCase(),
          companyId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Contact email must be unique');
        }
      }
      throw error;
    }
  }

  async list(
    companyId: string,
    query?: { accountId?: string; search?: string },
  ) {
    const where: Prisma.ContactWhereInput = {
      companyId,
      ...(query?.accountId ? { accountId: query.accountId } : {}),
    };
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(companyId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, companyId },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(companyId: string, id: string, payload: UpdateContactDto) {
    const updateResult = await this.prisma.contact
      .updateMany({
        where: { id, companyId },
        data: {
          ...payload,
          email: payload.email ? payload.email.toLowerCase() : undefined,
        },
      })
      .catch((error) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Contact email must be unique');
        }
        throw error;
      });
    if (updateResult.count === 0) {
      throw new NotFoundException('Contact not found');
    }
    return this.prisma.contact.findFirstOrThrow({
      where: { id, companyId },
    });
  }

  async delete(companyId: string, id: string) {
    const result = await this.prisma.contact.deleteMany({
      where: { id, companyId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Contact not found');
    }
    return { message: 'Contact deleted' };
  }
}
