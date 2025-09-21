import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StageChangesService } from './stage-changes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('stage-changes')
@Controller('stage-changes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StageChangesController {
  constructor(private readonly stageChangesService: StageChangesService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('stage') stage?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.stageChangesService.list(user.companyId, { stage, from, to });
  }
}
