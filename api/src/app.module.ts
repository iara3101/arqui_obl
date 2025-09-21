import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { RequestContextModule } from './common/context/request-context.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { MailerModule } from './infrastructure/mailer/mailer.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { ApiKeysModule } from './modules/apikeys/apikeys.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { StageChangesModule } from './modules/stage-changes/stage-changes.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    RequestContextModule,
    PrismaModule,
    MetricsModule,
    MailerModule,
    StorageModule,
    AuthModule,
    TenancyModule,
    CompaniesModule,
    UsersModule,
    ApiKeysModule,
    AccountsModule,
    ContactsModule,
    OpportunitiesModule,
    StageChangesModule,
    AttachmentsModule,
    ReportsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
