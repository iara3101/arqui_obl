import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { ApikeysModule } from './modules/apikeys/apikeys.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { StageChangesModule } from './modules/stage-changes/stage-changes.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenancyModule } from './tenancy/tenancy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CommonModule,
    TenancyModule,
    PrismaModule,
    HealthModule,
    MetricsModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    ApikeysModule,
    AccountsModule,
    ContactsModule,
    OpportunitiesModule,
    StageChangesModule,
    AttachmentsModule,
    ReportsModule,
  ],
})
export class AppModule {}
