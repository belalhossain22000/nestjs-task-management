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
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly mailService: MailService,
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

  // forgot password
  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    // IMPORTANT: always return success (avoid user enumeration)
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.passwordResetRepository.create(user.id, otp, expiresAt);

    await this.mailService.sendOtpEmail(user.email, otp);

    return null;
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // 1️⃣ Find user by email
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      // 🔐 avoid user enumeration
      throw new BadRequestException('Invalid or expired OTP');
    }

    // 2️⃣ Find valid OTP for this user
    const record = await this.passwordResetRepository.findValidOtp(
      user.id,
      otp,
    );

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // 3️⃣ Hash new password
    const saltRounds = Number(this.configService.get('SALT_ROUNDS', 10));

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4️⃣ Update user password
    await this.usersRepository.update(user.id, hashedPassword);

    // 5️⃣ Mark OTP as used (or delete it)
    await this.passwordResetRepository.markUsed(record.id);

    // 6️⃣ delete expired OTPs
    await this.passwordResetRepository.deleteExpired();

    return null;
  }
}
