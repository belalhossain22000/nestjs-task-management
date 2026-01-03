import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { PrismaQueryBuilder } from 'src/common/query-builder/prisma-query.builder';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Find users with pagination, filtering, search
  async findAll(query: UserQueryDto) {
    const { skip, take, metaInput } = PrismaQueryBuilder.buildPagination(query);

    const where = PrismaQueryBuilder.buildWhere<Prisma.UserWhereInput>({
      query,
      searchableFields: ['name', 'email'],
      filterableFields: ['role'],
    });

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      meta: PrismaQueryBuilder.buildMeta(total, metaInput),
      data,
    };
  }

  // 🔹 Find user by ID (NO THROW)
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // 🔹 Find user by email (NO THROW)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 🔹 Create user
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  // 🔹 Update user (GENERIC UPDATE)
  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // 🔹 Delete user
  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
