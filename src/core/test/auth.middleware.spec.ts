import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserMapper } from '@contexts/user/user.mapper';
import {
  MOCK_authJwtTokenDto,
  MOCK_authTokenBlackListEntity,
  MOCK_token,
  MOCK_userEntity,
} from '@mocks/app-mocks';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { AuthJwtTokenDto } from '@core/dtos/auth/auth-jwt-token.dto';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let userRepositoryMock: Partial<UserRepository>;
  let jwtServiceMock: Partial<JwtService>;
  let configServiceMock: Partial<ConfigService>;
  let userMapperMock: Partial<UserMapper>;
  let authTokenBlackListRepositoryMock: Partial<AuthTokenBlackListRepository>;

  beforeEach(async () => {
    authTokenBlackListRepositoryMock = {
      getEntityByToken: jest.fn().mockResolvedValue(null),
    };
    userRepositoryMock = {
      getEntityById: jest.fn().mockResolvedValue(MOCK_userEntity),
    };
    jwtServiceMock = {
      verify: jest.fn().mockReturnValue(MOCK_authJwtTokenDto),
    };
    configServiceMock = {
      get: jest.fn(),
    };
    userMapperMock = {
      userEntityToUserDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: AuthTokenBlackListRepository,
          useValue: authTokenBlackListRepositoryMock,
        },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: UserMapper, useValue: userMapperMock },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
  });

  it('should call next() if no token in header', async () => {
    const req = { headers: {}, user: undefined } as Request;
    const res = {} as Response;
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should set user information and call next() for valid token', async () => {
    const req = {
      headers: { authorization: `Bearer ${MOCK_token}` },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    const authJwtTokenDto: AuthJwtTokenDto = jwtServiceMock.verify(MOCK_token, {
      secret: 'YOUR_JWT_SECRET',
    });
    expect(authJwtTokenDto).toEqual(MOCK_authJwtTokenDto);

    const userEntity: UserEntity = await userRepositoryMock.getEntityById(
      MOCK_userEntity.id,
    );
    expect(userEntity).toEqual(MOCK_userEntity);

    await middleware.use(req, res, next);

    expect(jwtServiceMock.verify).toHaveBeenCalledWith(MOCK_token, {
      secret: 'YOUR_JWT_SECRET',
    });
    expect(req.user).toEqual(authJwtTokenDto);
    expect(next).toHaveBeenCalled();
  });

  it('should log error and call next() if token verification fails', async () => {
    const req = {
      headers: { authorization: 'Bearer INVALID_TOKEN' },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();
    const tokenError = 'Token verification failed';
    const error = new Error(tokenError);

    jwtServiceMock.verify['mockImplementation'](() => {
      throw error;
    });

    try {
      jwtServiceMock
        .verify(MOCK_token, {
          secret: 'YOUR_JWT_SECRET',
        })
        .mockImplementation(() => {
          throw error;
        });
    } catch (error: any) {
      expect(error.message).toBe(tokenError);
    }

    await middleware.use(req, res, next);

    expect(jwtServiceMock.verify).toHaveBeenCalledWith(MOCK_token, {
      secret: 'YOUR_JWT_SECRET',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should call next() if authJwtTokenDto does not exist', async () => {
    const req = {
      headers: { authorization: `Bearer ${MOCK_token}` },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    jwtServiceMock.verify['mockImplementation'](() => {
      return null;
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() if authJwtTokenDto does not have id property', async () => {
    const req = {
      headers: { authorization: `Bearer ${MOCK_token}` },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    jwtServiceMock.verify['mockImplementation'](() => {
      return {};
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() if user does not exist', async () => {
    const req = {
      headers: { authorization: 'Bearer VALID_TOKEN' },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    userRepositoryMock.getEntityById['mockImplementation'](() => {
      return null;
    });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw exception if token is blacklisted', async () => {
    const req = {
      headers: { authorization: 'Bearer VALID_TOKEN' },
      user: undefined,
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    authTokenBlackListRepositoryMock.getEntityByToken['mockImplementation'](
      () => MOCK_authTokenBlackListEntity,
    );
    try {
      await middleware.use(req, res, next);
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('invalid token');
    }
  });
});
