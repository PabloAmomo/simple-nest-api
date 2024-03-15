import {
  DEFAULT_VALID_IMAGE_EXTENSIONS,
  MAX_FILE_DEFAULT_SIZE_BYTES,
} from '@core/constants/constants';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as path from 'path';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private configService: ConfigService = new ConfigService();

  constructor(
    private readonly maxSizeName: string = 'MAX_FILE_DEFAULT_SIZE_BYTES',
    private readonly validExtensions: string[] = DEFAULT_VALID_IMAGE_EXTENSIONS,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const maxSize = this.configService.get<number>(
      this.maxSizeName,
      MAX_FILE_DEFAULT_SIZE_BYTES,
    );

    const fileSize: number = file?.size ?? Number.MAX_VALUE;
    if (fileSize > maxSize) {
      throw new InvalidDataException(
        `The file size exceeds the allowed limit of ${maxSize} bytes`,
      );
    }

    const name = file?.originalname ?? '';
    if (!name) {
      throw new InvalidDataException('file not found');
    }

    const extension = path.extname(name).toLowerCase().replace('.', '');
    if (
      this.validExtensions.length > 0 &&
      !this.validExtensions.includes(extension)
    ) {
      throw new InvalidDataException(
        `the file extension ${extension} is not allowed`,
      );
    }

    return next.handle();
  }
}
