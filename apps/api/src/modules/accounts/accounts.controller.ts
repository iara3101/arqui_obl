import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @CurrentCompany() companyId: string,
    @CurrentUser() _user: RequestUser,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CurrentCompany() companyId: string,
    @Query() query: ListAccountsQueryDto,
  ) {
    return this.accountsService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.accountsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.accountsService.remove(companyId, id);
  }
}
