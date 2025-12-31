import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './common/seed/seed.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminSeedService } from './common/seed/admin.seed';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SeedModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ✅ Global Response Interceptor (WITH Reflector support)
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // ✅ Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly adminSeed: AdminSeedService) {}

  async onModuleInit() {
    // ⚠️ TEMP SAFETY (remove later)
    if (process.env.NODE_ENV !== 'production') {
      await this.adminSeed.seedAdmin();
    }
  }
}
