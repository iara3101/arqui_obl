import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AllowApiKey } from '../../common/decorators/api-key.decorator';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiKeyGuard } from '../apikeys/guards/api-key.guard';
import { StageChangesService } from './stage-changes.service';
import { ListStageChangesQueryDto } from './dto/list-stage-changes-query.dto';

@ApiTags('Stage Changes')
@ApiBearerAuth()
@ApiSecurity('api-key')
@UseGuards(JwtAuthGuard, RolesGuard, ApiKeyGuard)
@Controller('stage-changes')
export class StageChangesController {
  constructor(private readonly stageChangesService: StageChangesService) {}

  @AllowApiKey()
  @Get()
  findAll(@CurrentCompany() companyId: string, @Query() query: ListStageChangesQueryDto) {
    return this.stageChangesService.findAll(companyId, query);
  }
}
