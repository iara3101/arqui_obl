import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface PresignedUpload {
  url: string;
  fields?: Record<string, string>;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly presignExpires: number;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    this.bucket = this.configService.getOrThrow<string>('S3_BUCKET');
    this.presignExpires = Number(this.configService.get<string>('S3_PRESIGN_EXPIRES', '300'));
    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  async createUploadUrl(params: {
    contentType: string;
    contentLength?: number;
    prefix?: string;
  }): Promise<PresignedUpload> {
    const key = `${params.prefix ?? 'uploads'}/${randomUUID()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: this.presignExpires });
    return { url, key };
  }
}
