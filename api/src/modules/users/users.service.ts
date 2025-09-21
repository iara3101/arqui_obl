import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly passwordService: PasswordService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async inviteUser(
    companyId: string,
    payload: InviteUserDto,
    inviterEmail: string,
  ) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt)
      : new Date(Date.now() + 7 * 24 * 3600 * 1000);

    const passwordPlaceholder = await this.passwordService.hash(
      randomBytes(16).toString('hex'),
    );

    await this.prisma.user.upsert({
      where: {
        companyId_email: {
          companyId,
          email: payload.email.toLowerCase(),
        },
      },
      create: {
        companyId,
        email: payload.email.toLowerCase(),
        passwordHash: passwordPlaceholder,
        role: payload.role ?? UserRole.MEMBER,
        forcePasswordReset: true,
        invitationToken: tokenHash,
        invitationExpiresAt: expiresAt,
      },
      update: {
        role: payload.role ?? UserRole.MEMBER,
        forcePasswordReset: true,
        invitationToken: tokenHash,
        invitationExpiresAt: expiresAt,
      },
    });

    await this.mailer.sendMail({
      to: payload.email,
      subject: 'CRM Invitation',
      text: `You have been invited to the CRM by ${inviterEmail}. Use this token to accept: ${token}`,
    });

    return { token, expiresAt };
  }

  async acceptInvitation(payload: AcceptInvitationDto) {
    const tokenHash = this.hashToken(payload.token);
    const user = await this.prisma.user.findFirst({
      where: {
        invitationToken: tokenHash,
        invitationExpiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invitation token invalid or expired');
    }

    const passwordHash = await this.passwordService.hash(payload.password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        forcePasswordReset: false,
        invitationToken: null,
        invitationExpiresAt: null,
      },
    });

    return { message: 'Invitation accepted' };
  }

  async changePassword(userId: string, payload: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const matches = await this.passwordService.compare(
      payload.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new BadRequestException('Current password invalid');
    }
    const newHash = await this.passwordService.hash(payload.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        forcePasswordReset: false,
      },
    });
    return { message: 'Password updated' };
  }

  async list(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        role: true,
        forcePasswordReset: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
