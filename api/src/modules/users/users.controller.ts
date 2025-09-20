import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async invite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: InviteUserDto,
  ) {
    if (!user.email) {
      throw new ForbiddenException('User context required');
    }
    return this.usersService.inviteUser(user.companyId, payload, user.email);
  }

  @Post('accept-invitation')
  async accept(@Body() payload: AcceptInvitationDto) {
    return this.usersService.acceptInvitation(payload);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ChangePasswordDto,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('User context required');
    }
    return this.usersService.changePassword(user.userId, payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.list(user.companyId);
  }
}
