import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAttachmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  opportunityId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @ApiProperty()
  @IsNotEmpty()
  size!: number;
}
