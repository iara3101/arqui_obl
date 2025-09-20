import { Module } from '@nestjs/common';
import { StageChangesController } from './stage-changes.controller';
import { StageChangesService } from './stage-changes.service';

@Module({
  controllers: [StageChangesController],
  providers: [StageChangesService],
  exports: [StageChangesService],
})
export class StageChangesModule {}
