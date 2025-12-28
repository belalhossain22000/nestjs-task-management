import { Module } from '@nestjs/common';
import { AdminSeedService } from './admin.seed';

@Module({
  providers: [AdminSeedService],
  exports: [AdminSeedService],
})
export class SeedModule {}
