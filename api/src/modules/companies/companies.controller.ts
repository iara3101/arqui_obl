import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() payload: CreateCompanyDto) {
    return this.companiesService.create(payload);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCurrent(@CurrentUser() user: any) {
    return this.companiesService.getCompany(user.companyId);
  }
}
