import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AllowApiKey } from '../../common/decorators/api-key.decorator';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiKeyGuard } from '../apikeys/guards/api-key.guard';
import { ReportsService } from './reports.service';
import { TopAccountsQueryDto } from './dto/top-accounts-query.dto';
import { StageChangesReportQueryDto } from './dto/stage-changes-report-query.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@ApiSecurity('api-key')
@UseGuards(JwtAuthGuard, RolesGuard, ApiKeyGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @AllowApiKey()
  @Get('top-accounts')
  topAccounts(@CurrentCompany() companyId: string, @Query() query: TopAccountsQueryDto) {
    return this.reportsService.topAccounts(companyId, query);
  }

  @AllowApiKey()
  @Get('stage-changes')
  stageChanges(@CurrentCompany() companyId: string, @Query() query: StageChangesReportQueryDto) {
    return this.reportsService.stageChanges(companyId, query);
  }
}
