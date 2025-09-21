import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateAccountDto,
  ) {
    return this.accountsService.create(user.companyId, payload);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.accountsService.list(user.companyId, {
      search,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.accountsService.get(user.companyId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.companyId, id, payload);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.accountsService.delete(user.companyId, id);
  }
}
