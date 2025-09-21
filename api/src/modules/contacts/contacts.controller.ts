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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateContactDto,
  ) {
    return this.contactsService.create(user.companyId, payload);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('accountId') accountId?: string,
    @Query('search') search?: string,
  ) {
    return this.contactsService.list(user.companyId, { accountId, search });
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.contactsService.get(user.companyId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: UpdateContactDto,
  ) {
    return this.contactsService.update(user.companyId, id, payload);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contactsService.delete(user.companyId, id);
  }
}
