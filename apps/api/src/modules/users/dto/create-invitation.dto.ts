import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.MEMBER;
}
