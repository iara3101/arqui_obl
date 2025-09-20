import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class InviteUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.MEMBER })
  @IsEnum(UserRole)
  role: UserRole = UserRole.MEMBER;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
