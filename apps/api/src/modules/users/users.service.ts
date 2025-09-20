import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { addDays } from 'date-fns';
import { HashService } from '../../common/providers/hash.service';
import { MailService } from '../../common/providers/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class UsersService {
  private readonly invitationTtlDays: number;
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.invitationTtlDays = Number(this.configService.get<string>('INVITATION_TTL_DAYS', '7'));
    this.frontendBaseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  }

  async findByEmail(companyId: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { companyId, email },
    });
  }

  private hashInvitationToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async inviteUser(companyId: string, requester: RequestUser, dto: CreateInvitationDto) {
    const token = randomUUID();
    const tokenHash = this.hashInvitationToken(token);
    const expiresAt = addDays(new Date(), this.invitationTtlDays);
    const role = dto.role ?? UserRole.MEMBER;

    const user = await this.prisma.user.upsert({
      where: {
        companyId_email: {
          companyId,
          email: dto.email,
        },
      },
      update: {
        role,
        invitationToken: tokenHash,
        invitationExpiresAt: expiresAt,
        forcePasswordReset: true,
      },
      create: {
        companyId,
        email: dto.email.toLowerCase(),
        role,
        passwordHash: await this.hashService.hash(randomUUID()),
        invitationToken: tokenHash,
        invitationExpiresAt: expiresAt,
        forcePasswordReset: true,
      },
    });

    const link = `${this.frontendBaseUrl}/accept-invitation?token=${token}&email=${encodeURIComponent(dto.email)}`;

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'CRM Invitation',
      html: `You have been invited to join the CRM. <a href="${link}">Click here</a> to accept the invitation.`,
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      invitedBy: requester.email,
      expiresAt,
      token,
    };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const tokenHash = this.hashInvitationToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        invitationToken: tokenHash,
        invitationExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Invitation not found or expired');
    }

    const passwordHash = await this.hashService.hash(dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        forcePasswordReset: false,
        invitationToken: null,
        invitationExpiresAt: null,
      },
    });

    return { email: user.email, companyId: user.companyId };
  }

  async changePassword(user: RequestUser, dto: ChangePasswordDto) {
    const record = await this.prisma.user.findUnique({ where: { id: user.userId } });
    if (!record) {
      throw new NotFoundException('User not found');
    }
    const matches = await this.hashService.compare(dto.currentPassword, record.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Current password is invalid');
    }
    const newHash = await this.hashService.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.userId },
      data: {
        passwordHash: newHash,
        forcePasswordReset: false,
      },
    });
    return { success: true };
  }
}
