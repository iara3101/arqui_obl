import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email.toLowerCase(),
        companyId: payload.companyId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.passwordService.compare(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.updateMany({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
        forcePasswordReset: user.forcePasswordReset,
      },
      {
        secret: this.configService.get<string>('auth.jwtSecret'),
        expiresIn: this.configService.get<string>('auth.jwtExpiresIn'),
      },
    );

    return {
      accessToken: token,
      forcePasswordReset: user.forcePasswordReset,
    };
  }
}
