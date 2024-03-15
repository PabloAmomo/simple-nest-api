import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('user not found', HttpStatus.NOT_FOUND);
  }
}

export const ApiUserNotFoundException: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'user not found',
};
