import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';
import type { RequestUser } from '../../../common/interfaces/request-user.interface';

export interface JwtPayload {
  sub: string;
  companyId: string;
  email: string;
  role: UserRole;
  forcePasswordReset?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      audience: configService.get<string>('JWT_AUDIENCE'),
      issuer: configService.get<string>('JWT_ISSUER'),
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      userId: payload.sub,
      companyId: payload.companyId,
      email: payload.email,
      role: payload.role,
      forcePasswordReset: payload.forcePasswordReset,
    };
  }
}
