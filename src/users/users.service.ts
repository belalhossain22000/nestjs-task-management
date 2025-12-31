import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserQueryDto } from './dto/user-query.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create new user (BUSINESS LOGIC)
   */
  async create(dto: CreateUserDto) {
    // ✅ business rule: email must be unique
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    // ✅ hash password (business concern)
    const saltRounds = this.configService.get<number>('SALT_ROUNDS', 10);
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    return this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
  }

  /**
   * Get users with pagination/filter/search
   */
  async findAll(query: UserQueryDto) {
    return this.usersRepository.findAll(query);
  }

  /**
   * Get single user
   */
  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto) {
    // optional business rule: ensure user exists
    await this.findOne(id);

    return this.usersRepository.update(id, dto);
  }

  /**
   * Delete user
   */
  async remove(id: string) {
    // optional business rule: ensure user exists
    await this.findOne(id);

    return this.usersRepository.delete(id);
  }
}
