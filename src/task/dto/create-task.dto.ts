import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
