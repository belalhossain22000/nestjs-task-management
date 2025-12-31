import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, token: string, expiresAt: Date) {
    return this.prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  findValid(token: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  markUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  }
}
