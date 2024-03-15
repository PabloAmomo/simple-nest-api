import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFound extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
