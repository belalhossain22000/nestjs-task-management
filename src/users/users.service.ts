import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  // 🔹 Create user
  async create(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = Number(this.configService.get('SALT_ROUNDS', 10));
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    return this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
  }

  // 🔹 Get users
  async findAll(query: UserQueryDto) {
    return this.usersRepository.findAll(query);
  }

  // 🔹 Get user by ID
  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // 🔹 Get profile
  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // 🔹 Update user
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.usersRepository.update(id, dto);
  }

  // 🔹 Delete user
  async remove(id: string) {
    await this.findOne(id);
    return this.usersRepository.delete(id);
  }
}
