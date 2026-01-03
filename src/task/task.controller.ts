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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserQueryDto } from 'src/users/dto/user-query.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // 1️⃣ Create task
  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(user.sub, createTaskDto);
  }

  // 2️⃣ Get all tasks of logged-in user
  @Get()
  findAll(@Query() query: TaskQueryDto, @CurrentUser() user: { sub: string }) {
    return this.taskService.findAll(user.sub, query);
  }

  // 3️⃣ Get single task (only owner)
  @Get(':id')
  findOne(
    @CurrentUser() user: { sub: string },
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.taskService.findOne(user.sub, id);
  }

  // 4️⃣ Update task
  @Patch(':id')
  update(
    @CurrentUser() user: { sub: string },
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(user.sub, id, updateTaskDto);
  }

  // 5️⃣ Delete task
  @Delete(':id')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.taskService.remove(user.sub, id);
  }
}
