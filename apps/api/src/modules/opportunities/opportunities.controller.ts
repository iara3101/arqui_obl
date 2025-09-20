import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ChangeOpportunityStageDto } from './dto/change-stage.dto';

@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  create(@CurrentCompany() companyId: string, @Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query() query: ListOpportunitiesQueryDto) {
    return this.opportunitiesService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.opportunitiesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(companyId, id, dto);
  }

  @Put(':id/stage')
  changeStage(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: ChangeOpportunityStageDto,
  ) {
    return this.opportunitiesService.changeStage(companyId, user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.opportunitiesService.remove(companyId, id);
  }
}
