import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HashService } from './providers/hash.service';
import { MailService } from './providers/mail.service';
import { StorageService } from './providers/storage.service';
import { TenantContextInterceptor } from './interceptors/tenant-context.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    HashService,
    MailService,
    StorageService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
  exports: [HashService, MailService, StorageService],
})
export class CommonModule {}
