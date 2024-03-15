import { MOCK_userLoggedDto } from '@mocks/app-mocks';
import { UserLoggedValue } from '../decorators/user-logged.decorator';

describe('UserLogged decorator', () => {
  it('should return entire user if no data is provided', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: MOCK_userLoggedDto,
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue(null, contextMock);
    expect(userLogged).toEqual(MOCK_userLoggedDto);
  });

  it('should return entire no user', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: undefined,
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue(null, contextMock);
    expect(userLogged).toEqual({});
  });

  it('should return data', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          userLogged: MOCK_userLoggedDto,
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue('name', contextMock);
    expect(userLogged).toEqual(MOCK_userLoggedDto.name);
  });
});

describe('UserLogged decorator (Usinf RAW ons request)', () => {
  it('should return entire user if no data is provided', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          raw: { userLogged: MOCK_userLoggedDto },
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue(null, contextMock);
    expect(userLogged).toEqual(MOCK_userLoggedDto);
  });

  it('should return entire no user', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          raw: { userLogged: undefined },
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue(null, contextMock);
    expect(userLogged).toEqual({});
  });

  it('should return data', () => {
    const contextMock = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          raw: { userLogged: MOCK_userLoggedDto },
        }),
      }),
    } as any;

    const userLogged = UserLoggedValue('name', contextMock);
    expect(userLogged).toEqual(MOCK_userLoggedDto.name);
  });
});
