import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { createHash, randomUUID } from 'crypto';

@Injectable()
export class ApikeysService {
  constructor(private readonly prisma: PrismaService) {}

  private hashSecret(secret: string) {
    return createHash('sha256').update(secret).digest('hex');
  }

  async create(companyId: string, user: RequestUser, dto: CreateApiKeyDto) {
    const rawKey = `${randomUUID().replace(/-/g, '').slice(0, 12)}.${randomUUID().replace(/-/g, '')}`;
    const prefix = rawKey.slice(0, 8);
    const hash = this.hashSecret(rawKey);
    const lastFour = rawKey.slice(-4);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        companyId,
        name: dto.name,
        jti: randomUUID(),
        hash,
        prefix,
        lastFour,
        createdById: user.userId,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix,
      lastFour,
      createdAt: apiKey.createdAt,
      apiKey: rawKey,
    };
  }

  async findAll(companyId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((item) => ({
      id: item.id,
      name: item.name,
      prefix: item.prefix,
      lastFour: item.lastFour,
      createdAt: item.createdAt,
      revokedAt: item.revokedAt,
      expiresAt: item.expiresAt,
    }));
  }

  async revoke(companyId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, companyId } });
    if (!key) {
      throw new NotFoundException('API key not found');
    }
    if (key.revokedAt) {
      return { success: true };
    }
    await this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async validate(rawKey: string) {
    const hash = this.hashSecret(rawKey);
    const prefix = rawKey.slice(0, 8);

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        prefix,
        hash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!apiKey) {
      throw new ForbiddenException('Invalid API key');
    }

    return apiKey;
  }
}
