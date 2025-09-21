import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}
