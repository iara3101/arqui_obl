import { OpportunityStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ChangeOpportunityStageDto {
  @IsEnum(OpportunityStage)
  newStage!: OpportunityStage;

  @IsOptional()
  @IsString()
  reason?: string;
}
