import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }
    return value;
  }
}
