import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { HashService } from '../../common/providers/hash.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser({ companyId, email, password }: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(companyId, email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.hashService.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(dto);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      forcePasswordReset: user.forcePasswordReset,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      forcePasswordReset: user.forcePasswordReset,
    };
  }
}
