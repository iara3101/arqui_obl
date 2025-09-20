import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePresignDto {
  @IsString()
  @IsNotEmpty()
  opportunityId!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  size?: number;
}
