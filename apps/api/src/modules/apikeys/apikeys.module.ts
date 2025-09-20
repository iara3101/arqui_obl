import { Module } from '@nestjs/common';
import { ApikeysController } from './apikeys.controller';
import { ApikeysService } from './apikeys.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  controllers: [ApikeysController],
  providers: [ApikeysService, ApiKeyGuard],
  exports: [ApikeysService, ApiKeyGuard],
})
export class ApikeysModule {}
