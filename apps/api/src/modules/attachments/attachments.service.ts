import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/providers/storage.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { CreatePresignDto } from './dto/create-presign.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService, private readonly storageService: StorageService) {}

  private async ensureOpportunity(companyId: string, opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  async createPresignedUrl(companyId: string, dto: CreatePresignDto) {
    await this.ensureOpportunity(companyId, dto.opportunityId);
    const upload = await this.storageService.createUploadUrl({
      contentType: dto.contentType,
      contentLength: dto.size,
      prefix: `companies/${companyId}/opportunities/${dto.opportunityId}`,
    });
    return upload;
  }

  async confirmUpload(companyId: string, user: RequestUser, dto: ConfirmUploadDto) {
    await this.ensureOpportunity(companyId, dto.opportunityId);
    return this.prisma.attachment.create({
      data: {
        companyId,
        opportunityId: dto.opportunityId,
        filename: dto.filename,
        contentType: dto.contentType,
        storageKey: dto.storageKey,
        size: dto.size ?? 0,
        uploadedById: user.userId,
      },
    });
  }

  async list(companyId: string, opportunityId: string) {
    return this.prisma.attachment.findMany({
      where: { companyId, opportunityId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
