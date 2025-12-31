import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../users/users.repository';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PasswordResetRepository } from './password-reset.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  //change password
  async changePassword(userId: string, newPassword: string) {
    const saltRounds = Number(this.configService.get('SALT_ROUNDS', 10));
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    return this.usersRepository.update(userId, { password: hashedPassword });
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    // IMPORTANT: always return success (avoid user enumeration)
    if (!user) {
      return null;
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.passwordResetRepository.create(user.id, token, expiresAt);

    // 🔥 send email here (Brevo / SMTP)
    // reset link example:
    // https://frontend.com/reset-password?token=XXXX

    return null;
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.passwordResetRepository.findValid(token);

    if (!record) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const saltRounds = Number(this.configService.get('SALT_ROUNDS', 10));
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepository.update(record.userId, hashedPassword);

    await this.passwordResetRepository.markUsed(record.id);

    return null;
  }
}
