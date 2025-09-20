import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  opportunityId!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  size?: number;
}
