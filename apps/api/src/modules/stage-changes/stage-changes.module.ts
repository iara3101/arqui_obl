import { Module } from '@nestjs/common';
import { ApikeysModule } from '../apikeys/apikeys.module';
import { StageChangesController } from './stage-changes.controller';
import { StageChangesService } from './stage-changes.service';

@Module({
  imports: [ApikeysModule],
  controllers: [StageChangesController],
  providers: [StageChangesService],
  exports: [StageChangesService],
})
export class StageChangesModule {}
