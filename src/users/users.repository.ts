import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { PrismaQueryBuilder } from 'src/common/query-builder/prisma-query.builder';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find users with pagination, filtering, and search
   */
  async findAll(query: UserQueryDto) {
    const { skip, take, metaInput } = PrismaQueryBuilder.buildPagination(query);

    const where = PrismaQueryBuilder.buildWhere<Prisma.UserWhereInput>({
      query,
      searchableFields: ['name', 'email'],
      filterableFields: ['role', 'name', 'email'],
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

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const result = this.prisma.user.findUnique({
      where: { id },
    });

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const result = this.prisma.user.findUnique({
      where: { email },
    });

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  /**
   * Create user
   */
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    const result = await this.findById(id);

    if (!result) {
      throw new Error('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        password: data.password,
      },
    });
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    const result = await this.findById(id);

    if (!result) {
      throw new Error('User not found');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
