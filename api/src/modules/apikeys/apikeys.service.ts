import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID, createHash } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(companyId: string, payload: CreateApiKeyDto) {
    const id = randomUUID();
    const jti = randomUUID();
    const token = await this.jwtService.signAsync(
      {
        sub: id,
        companyId,
        jti,
      },
      {
        secret: this.configService.get<string>('auth.apiKeySecret'),
        expiresIn: '365d',
      },
    );
    const hash = createHash('sha256').update(token).digest('hex');
    const lastFour = token.slice(-4);
    await this.prisma.apiKey.create({
      data: {
        id,
        companyId,
        name: payload.name,
        jti,
        hash,
        lastFour,
      },
    });
    return { id, apiKey: token, lastFour };
  }

  async list(companyId: string) {
    return this.prisma.apiKey.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        revokedAt: true,
        lastFour: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(companyId: string, id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey || apiKey.companyId !== companyId) {
      throw new NotFoundException('API key not found');
    }
    if (apiKey.revokedAt) {
      throw new ForbiddenException('API key already revoked');
    }
    await this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    return { message: 'API key revoked' };
  }
}
