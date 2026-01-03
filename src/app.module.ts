import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';

import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './common/seed/seed.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminSeedService } from './common/seed/admin.seed';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SeedModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtAuthGuard,

    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
