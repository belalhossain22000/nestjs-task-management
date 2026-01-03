import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ResponseMessage } from 'src/common/interceptors/response.interceptor';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Create user
  @Post()
  @ResponseMessage('User created successfully')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ✅ Get users
  @Get()
  @ResponseMessage('Users retrieved successfully')
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  // ✅ GET PROFILE (MUST BE BEFORE :id)
  @Get('profile')
  @ResponseMessage('User retrieved successfully')
  getProfile(@CurrentUser() user: { sub: string }) {
    return this.usersService.getProfile(user.sub);
  }

  // ✅ Get single user
  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // ✅ Update user
  @Patch(':id')
  @ResponseMessage('User updated successfully')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // ✅ Delete user
  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.remove(id);
  }
}
