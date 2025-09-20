import { OpportunityStage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  probability?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expectedCloseAt?: Date;

  @IsOptional()
  @IsString()
  description?: string;
}
