import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { CreatePresignDto } from './dto/create-presign.dto';
import { ConfirmAttachmentDto } from './dto/confirm-attachment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attachments')
@Controller('attachments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('presign')
  async presign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreatePresignDto,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('User context required');
    }
    return this.attachmentsService.createPresignedUrl(
      user.companyId,
      user.userId,
      payload,
    );
  }

  @Post('confirm')
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ConfirmAttachmentDto,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('User context required');
    }
    return this.attachmentsService.confirmUpload(
      user.companyId,
      user.userId,
      payload,
    );
  }

  @Get(':opportunityId')
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.attachmentsService.listByOpportunity(
      user.companyId,
      opportunityId,
    );
  }

  @Get('download/:id')
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.attachmentsService.createDownloadUrl(user.companyId, id);
  }
}
