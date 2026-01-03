import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserQueryDto } from 'src/users/dto/user-query.dto';
import { PrismaQueryBuilder } from 'src/common/query-builder/prisma-query.builder';
import { Prisma } from '@prisma/client';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  // 1️⃣ Create task
  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        status: dto.status,
        userId,
      },
    });
  }

  // 2️⃣ Get all tasks of logged-in user
  async findAll(userId: string, query: TaskQueryDto) {
    const { skip, take, metaInput } = PrismaQueryBuilder.buildPagination(query);

    const dynamicWhere = PrismaQueryBuilder.buildWhere<Prisma.TaskWhereInput>({
      query,
      searchableFields: ['title'],
      filterableFields: ['status'],
    });

    const where: Prisma.TaskWhereInput = {
      ...dynamicWhere,
      userId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      meta: PrismaQueryBuilder.buildMeta(total, metaInput),
      data,
    };
  }

  // 3️⃣ Get single task by id (owned by user)
  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  // 4️⃣ Update task
  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        status: dto.status,
      },
    });
  }

  // 5️⃣ Delete task
  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return null;
  }
}
