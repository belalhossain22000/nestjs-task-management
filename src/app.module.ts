import { Module, OnModuleInit } from '@nestjs/common';
import { SeedModule } from './common/seed/seed.module';
import { AdminSeedService } from './common/seed/admin.seed';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SeedModule, UsersModule],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly adminSeed: AdminSeedService) {}

  async onModuleInit() {
    await this.adminSeed.seedAdmin();
  }
}
