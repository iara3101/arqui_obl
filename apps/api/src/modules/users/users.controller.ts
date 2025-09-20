import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post('invitations')
  invite(
    @CurrentCompany() companyId: string,
    @CurrentUser() currentUser: RequestUser,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.usersService.inviteUser(companyId, currentUser, dto);
  }

  @Public()
  @Post('accept-invitation')
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.usersService.acceptInvitation(dto);
  }

  @Post('change-password')
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user, dto);
  }
}
