import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PasswordService } from '../common/password.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, PasswordService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
