import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateOpportunityStageDto } from './dto/update-opportunity-stage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('opportunities')
@Controller('opportunities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(user.companyId, payload);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('stage') stage?: string,
    @Query('accountId') accountId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.opportunitiesService.list(user.companyId, {
      stage,
      accountId,
      from,
      to,
    });
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.opportunitiesService.get(user.companyId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(user.companyId, id, payload);
  }

  @Post(':id/stage')
  async updateStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: UpdateOpportunityStageDto,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('User context required');
    }
    return this.opportunitiesService.updateStage(
      user.companyId,
      id,
      user.userId,
      payload,
    );
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.delete(user.companyId, id);
  }
}
