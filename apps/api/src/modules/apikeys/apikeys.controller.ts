import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { UserRole } from '@prisma/client';
import { ApikeysService } from './apikeys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('apikeys')
export class ApikeysController {
  constructor(private readonly apikeysService: ApikeysService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apikeysService.create(companyId, user, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@CurrentCompany() companyId: string) {
    return this.apikeysService.findAll(companyId);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  revoke(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.apikeysService.revoke(companyId, id);
  }
}
