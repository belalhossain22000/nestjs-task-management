import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger('AdminSeed');

  constructor(private readonly prisma: PrismaService) {}

  async seedAdmin() {
    const adminEmail = 'admin@taskmanager.com';

    const exists = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (exists) {
      this.logger.log('Admin already exists ✔');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await this.prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    this.logger.warn('Admin user created successfully 🚀');
  }
}
