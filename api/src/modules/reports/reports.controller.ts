import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtOrApiKeyGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('top-accounts')
  async topAccounts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.topAccounts(user.companyId, {
      limit: limit ? Number(limit) : undefined,
      from,
      to,
    });
  }

  @Get('stage-changes')
  async stageChanges(
    @CurrentUser() user: AuthenticatedUser,
    @Query('stage') stage?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.stageChanges(user.companyId, {
      stage,
      from,
      to,
    });
  }
}
