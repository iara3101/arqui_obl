import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { CreatePresignDto } from './dto/create-presign.dto';
import { ConfirmAttachmentDto } from './dto/confirm-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async createPresignedUrl(
    companyId: string,
    userId: string,
    payload: CreatePresignDto,
  ) {
    const storageKey = `${companyId}/${payload.opportunityId}/${randomUUID()}-${payload.filename}`;
    const uploadUrl = await this.storage.createUploadUrl(
      storageKey,
      payload.contentType,
    );
    return { uploadUrl, storageKey };
  }

  async confirmUpload(
    companyId: string,
    userId: string,
    payload: ConfirmAttachmentDto,
  ) {
    const attachment = await this.prisma.attachment.create({
      data: {
        companyId,
        opportunityId: payload.opportunityId,
        filename: payload.filename,
        contentType: payload.contentType,
        storageKey: payload.storageKey,
        size: Number(payload.size),
        uploadedById: userId,
      },
    });
    return attachment;
  }

  async listByOpportunity(companyId: string, opportunityId: string) {
    return this.prisma.attachment.findMany({
      where: { companyId, opportunityId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async createDownloadUrl(companyId: string, id: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, companyId },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    const url = await this.storage.createDownloadUrl(attachment.storageKey);
    return {
      url,
      contentType: attachment.contentType,
      filename: attachment.filename,
    };
  }
}
