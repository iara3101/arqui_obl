import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AttachmentsService } from './attachments.service';
import { CreatePresignDto } from './dto/create-presign.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('presign')
  presign(@CurrentCompany() companyId: string, @Body() dto: CreatePresignDto) {
    return this.attachmentsService.createPresignedUrl(companyId, dto);
  }

  @Post('confirm')
  confirm(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.attachmentsService.confirmUpload(companyId, user, dto);
  }

  @Get(':opportunityId')
  list(@CurrentCompany() companyId: string, @Param('opportunityId') opportunityId: string) {
    return this.attachmentsService.list(companyId, opportunityId);
  }
}
