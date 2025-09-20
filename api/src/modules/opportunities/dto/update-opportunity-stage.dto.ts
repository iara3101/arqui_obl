import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OpportunityStage } from '../../../common/enums/opportunity-stage.enum';

export class UpdateOpportunityStageDto {
  @ApiProperty({ enum: OpportunityStage })
  @IsEnum(OpportunityStage)
  newStage!: OpportunityStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
