import { FileUploadInterceptor } from '../interceptors/file-upload.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

jest.mock('@nestjs/config');

describe('FileSizeInterceptor Check Sizes', () => {
  let interceptor: FileUploadInterceptor;
  let executionContextMock: ExecutionContext;
  let callHandlerMock: CallHandler;

  beforeEach(() => {
    interceptor = new FileUploadInterceptor();

    callHandlerMock = {
      handle: jest.fn().mockReturnValue(of({})), // Simulate the CallHandler returning an Observable
    };
  });

  it('should allow files within the size limit', (done) => {
    executionContextMock = createExecutionContextMock(50000); // 50 KB

    // Simulate the ConfigService to return a specific max file size
    ConfigService.prototype.get = jest.fn().mockReturnValue(100000); // 100 KB

    interceptor.intercept(executionContextMock, callHandlerMock).subscribe({
      complete: () => {
        expect(callHandlerMock.handle).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should throw BadRequestException for files exceeding the size limit', () => {
    executionContextMock = createExecutionContextMock(200000); // 200 KB

    // Simulate the ConfigService to return a specific max file size
    ConfigService.prototype.get = jest.fn().mockReturnValue(100000); // 100 KB

    expect(() => {
      interceptor.intercept(executionContextMock, callHandlerMock);
    }).toThrow('The file size exceeds the allowed limit of 100000 bytes');
  });
});

describe('FileSizeInterceptor check extensions', () => {
  let interceptor: FileUploadInterceptor;
  const mockCallHandler: CallHandler = {
    handle: () => of({ success: true }),
  };

  it('should throw exeption with invalid extension', async () => {
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {
            originalname: 'image.jpg',
            size: 1000,
          },
        }),
      }),
    } as any;

    interceptor = new FileUploadInterceptor('MAX_FILE_DEFAULT_SIZE_BYTES', [
      'png',
    ]);

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('the file extension jpg is not allowed');
  });

  it('should allow files with the correct extension', async () => {
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {
            originalname: 'image.jpg',
            size: 1000,
          },
        }),
      }),
    } as any;

    interceptor = new FileUploadInterceptor('MAX_FILE_DEFAULT_SIZE_BYTES', [
      'jpg',
      'png',
    ]);

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow files with the correct extension (Default system)', async () => {
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {
            originalname: 'image.jpg',
            size: 1000,
          },
        }),
      }),
    } as any;

    interceptor = new FileUploadInterceptor('MAX_FILE_DEFAULT_SIZE_BYTES');

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should return exception by invalid name', async () => {
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {
            size: 1000,
          },
        }),
      }),
    } as any;

    interceptor = new FileUploadInterceptor('MAX_FILE_DEFAULT_SIZE_BYTES');

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow();
  });

  it('should return exception by invalid size', async () => {
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          file: {
            originalname: 'image.jpg',
          },
        }),
      }),
    } as any;

    interceptor = new FileUploadInterceptor('MAX_FILE_DEFAULT_SIZE_BYTES');

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow();
  });
});

function createExecutionContextMock(fileSize: number): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        file: {
          size: fileSize,
          originalname: 'image.jpg',
        },
      }),
    }),
  } as unknown as ExecutionContext;
}
