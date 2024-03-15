import { AuthController } from '../auth.controller';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthService } from '../auth.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseAuth } from '@contexts/auth/repositories/auth/auth.database';
import { DatabaseUser } from '@contexts/user/repositories/user.database';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@contexts/auth/auth-strategies/jwt.strategy';
import { LocalIdStrategy } from '@contexts/auth/auth-strategies/local-id.strategy';
import { RolesGuard } from '@core/guards/roles.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';
import JwtModuleConfig from '../configs/jwt-module.config';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { UnauthorizedException } from '@nestjs/common';
import {
  REPO_DATASOURCE_LOG as REPO_DATASOURCE_USER_LOG,
  REPO_DATASOURCE as REPO_DATASOURCE_USER,
} from '@contexts/user/repositories/user.constants';
import {
  REPO_DATASOURCE as REPO_DATASOURCE_AUTH,
  REPO_DATASOURCE_LOG as REPO_DATASOURCE_AUTH_LOG,
} from '@contexts/auth/repositories/auth/auth.constants';
import { AuthLogEntity } from '../repositories/auth/auth-log/auth-log.entity';
import { DatabaseAuthLog } from '../repositories/auth/auth-log/auth-log.database';
import { UserLogEntity } from '@contexts/user/repositories/user-log/user-log.entity';
import { DatabaseUserLog } from '@contexts/user/repositories/user-log/user-log.database';

const MOCK_SOME_TOKEN = 'someToken';
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync(JwtModuleConfig),
        TypeOrmModule.forRootAsync(DatabaseUser),
        TypeOrmModule.forFeature([UserEntity], REPO_DATASOURCE_USER),

        TypeOrmModule.forRootAsync(DatabaseUserLog),
        TypeOrmModule.forFeature([UserLogEntity], REPO_DATASOURCE_USER_LOG),

        TypeOrmModule.forRootAsync(DatabaseAuth),
        TypeOrmModule.forFeature([AuthEntity], REPO_DATASOURCE_AUTH),

        TypeOrmModule.forRootAsync(DatabaseAuthLog),
        TypeOrmModule.forFeature([AuthLogEntity], REPO_DATASOURCE_AUTH_LOG),
      ],
      providers: [
        LocalIdStrategy,
        JwtStrategy,
        RolesGuard,
        UserRepository,
        AuthRepository,
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: AuthService,
          useValue: {
            logout: jest.fn().mockResolvedValue(null),
            checkHealth: jest.fn(() => 'service response'),
            changePassword: jest.fn().mockResolvedValue(undefined),
            activate: jest.fn().mockResolvedValue(undefined),
            login: jest.fn().mockResolvedValue({ token: MOCK_SOME_TOKEN }),
            tokenRefresh: jest
              .fn()
              .mockResolvedValue({ token: MOCK_SOME_TOKEN }),
          },
        },
      ],
      controllers: [AuthController],
      exports: [RolesGuard],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should check health', async () => {
    expect(authController.checkHealth()).toBe('service response');
    expect(authService.checkHealth).toHaveBeenCalled();
  });

  it('should activate user by GET', async () => {
    const id = 'someUserId';
    const activationToken = MOCK_SOME_TOKEN;
    const query = { activationToken };
    await authController.activateUserByGet(id, query);

    expect(authService.activate).toHaveBeenCalledWith(id, activationToken);
  });

  it('should activate user by PUT', async () => {
    const id = 'someUserId';
    const activationToken = MOCK_SOME_TOKEN;
    const authReqValidationTokenDto = { activationToken };

    await authController.activateUserByPut(id, authReqValidationTokenDto);

    expect(authService.activate).toHaveBeenCalledWith(id, activationToken);
  });

  it('should change user password', async () => {
    const id = 'someUserId';
    const password = 'newPassword';

    await authController.changePassword(id, password);

    expect(authService.changePassword).toHaveBeenCalledWith(id, password);
  });

  it('should generate exception with invalid id', async () => {
    try {
      await authController.changePassword('', MOCK.MOCK_password);
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error.message).toBe('invalid user id');
    }
  });

  it('should generate exception with invalid password', async () => {
    try {
      await authController.changePassword(MOCK.MOCK_USER_ID_ADMIN, '');
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error.message).toBe('invalid password');
    }
  });

  it('should return token for loged user (by id)', async () => {
    const mockUser = { user: MOCK.MOCK_userDto };

    const result = await authController.loginId(mockUser);

    expect(result).toEqual({ token: MOCK_SOME_TOKEN });
  });

  it('should return token for loged user (by email)', async () => {
    const mockUser = { user: MOCK.MOCK_userDto };

    const result = await authController.loginEmail(mockUser);

    expect(result).toEqual({ token: MOCK_SOME_TOKEN });
  });

  it('should tokenRefresh generate token refresh', async () => {
    const result = await authController.tokenRefresh(
      { user: MOCK.MOCK_authEntity },
      MOCK.MOCK_token,
    );
    expect(authService.tokenRefresh).toHaveBeenCalledWith(
      MOCK.MOCK_authEntity.id,
      MOCK.MOCK_token,
    );
    expect(result).toEqual({ token: MOCK_SOME_TOKEN });
  });

  it('should tokenRefresh generate exception with invalid user id', async () => {
    try {
      await authController.tokenRefresh('', '');
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('invalid user id');
    }
  });

  it('should tokenRefresh generate exception with invalid token', async () => {
    try {
      await authController.tokenRefresh({ user: MOCK.MOCK_authEntity }, '');
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error.message).toBe('invalid token');
    }
  });

  it('should logout generate exception with invalid bearer token in header (No auth header)', async () => {
    try {
      await authController.logout(
        {
          headers: {},
          user: MOCK.MOCK_authEntity,
        },
        '',
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('invalid token');
    }
  });

  it('should logout generate exception with invalid bearer token in header', async () => {
    try {
      await authController.logout(
        {
          headers: { authorization: `bearer ` },
          user: MOCK.MOCK_authEntity,
        },
        '',
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('invalid token');
    }
  });

  it('should logout generate exception with invalid refresh token', async () => {
    try {
      await authController.logout(
        {
          headers: { authorization: `bearer ${MOCK.MOCK_token}` },
          user: MOCK.MOCK_authEntity,
        },
        '',
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error.message).toBe('invalid refresh token');
    }
  });

  it('should logout with null response (Logout OK)', async () => {
    try {
      await authController.logout(
        {
          headers: { authorization: `bearer ${MOCK.MOCK_token}` },
          user: MOCK.MOCK_authEntity,
        },
        MOCK.MOCK_tokenRefresh,
      );
      expect(true).toBe(true);
    } catch (error: any) {
      expect(true).toBe(false);
    }
  });
});
