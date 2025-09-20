import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenancyModule } from '../tenancy/tenancy.module';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [ConfigModule, TenancyModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

