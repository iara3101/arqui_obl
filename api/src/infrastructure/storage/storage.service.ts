import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>('storage.endpoint');
    const port = this.configService.get<number>('storage.port');
    const useSsl = this.configService.get<boolean>('storage.useSsl') ?? false;
    this.bucket = this.configService.getOrThrow<string>('storage.bucket');
    const region = this.configService.getOrThrow<string>('storage.region');
    const accessKey =
      this.configService.getOrThrow<string>('storage.accessKey');
    const secretKey =
      this.configService.getOrThrow<string>('storage.secretKey');
    const endpointUrl = port
      ? `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`
      : `${useSsl ? 'https' : 'http'}://${endpoint}`;
    this.client = new S3Client({
      region,
      endpoint: endpointUrl,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  async createUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async createDownloadUrl(
    key: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
