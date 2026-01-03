import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1️⃣ Create OTP record
  create(userId: string, otp: string, expiresAt: Date) {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        otp,
        expiresAt,
        used: false,
      },
    });
  }

  // 2️⃣ Find valid OTP for a user
  findValidOtp(userId: string, otp: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        otp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  // 3️⃣ Mark OTP as used
  markUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  }

  // (optional) 4️⃣ Cleanup expired OTPs
  deleteExpired() {
    return this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
