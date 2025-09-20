import { Module } from '@nestjs/common';
import { ApikeysModule } from '../apikeys/apikeys.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ApikeysModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
