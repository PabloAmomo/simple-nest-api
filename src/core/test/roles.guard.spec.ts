import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { UserDto } from '@contexts/user/dtos/user.dto';
import * as MOCK from '@mocks/app-mocks';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: Partial<Reflector>;

  beforeAll(() => {
    reflectorMock = {
      get: jest.fn(),
    };

    guard = new RolesGuard(reflectorMock as Reflector);
  });

  it('should admin required', () => {
    const contextMock = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: MOCK.MOCK_userDtoRoleAdmin as UserDto,
        }),
      }),
    } as any;

    reflectorMock.get['mockReturnValue']([Role.Admin]);

    expect(guard.canActivate(contextMock)).toBe(true);
    expect(reflectorMock.get).toHaveBeenCalledWith('roles', undefined);
  });

  it('should test no userLogged', () => {
    const contextMock = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: undefined,
        }),
      }),
    } as any;

    reflectorMock.get['mockReturnValue']([Role.Admin]);

    expect(guard.canActivate(contextMock)).toBe(false);
    expect(reflectorMock.get).toHaveBeenCalledWith('roles', undefined);
  });

  it('should no roles required', () => {
    const contextMock = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: MOCK.MOCK_userDto as UserDto,
        }),
      }),
    } as any;

    reflectorMock.get['mockReturnValue'](undefined);

    expect(guard.canActivate(contextMock)).toBe(true);
    expect(reflectorMock.get).toHaveBeenCalledWith('roles', undefined);
  });

  it('should no user', () => {
    const contextMock = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: {} as UserDto,
        }),
      }),
    } as any;

    reflectorMock.get['mockReturnValue']([Role.Admin]);

    expect(guard.canActivate(contextMock)).toBe(false);
    expect(reflectorMock.get).toHaveBeenCalledWith('roles', undefined);
  });
});
