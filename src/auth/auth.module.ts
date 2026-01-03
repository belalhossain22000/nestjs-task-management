import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PasswordResetRepository } from './password-reset.repository';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_EXPIRES_IN',
            '1d',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [AuthService, PasswordResetRepository],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
