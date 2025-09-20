import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(request: FastifyRequest): Promise<any> {
    const token = (request.headers['x-api-key'] as string | undefined)?.trim();
    if (!token) {
      throw new UnauthorizedException('API key header missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.apiKeySecret'),
      });
      const hash = createHash('sha256').update(token).digest('hex');
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          id: payload.sub,
          companyId: payload.companyId,
          jti: payload.jti,
          hash,
          revokedAt: null,
        },
      });
      if (!apiKey) {
        throw new UnauthorizedException('API key revoked or invalid');
      }
      return {
        apiKeyId: apiKey.id,
        companyId: apiKey.companyId,
      };
    } catch {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
