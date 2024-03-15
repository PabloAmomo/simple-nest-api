import { AuthController } from '../auth.controller';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthListener } from '../auth.listener';
import { AuthMapper } from '../auth.mapper';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { AuthService } from '../auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@contexts/auth/auth-strategies/jwt.strategy';
import { LocalIdStrategy } from '@contexts/auth/auth-strategies/local-id.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from '@core/guards/roles.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import ConfigModuleConfig from '@core/configs/config-module.config';
import JwtModuleConfig from '../configs/jwt-module.config';
import * as MOCK from '@mocks/app-mocks';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import createPasswordHash from '@functions/create-hash';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';
import { AuthTokenBlackListRepositoryModule } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list-repository.module';

let mailUserTest = '';

describe('AuthService Mocked Repo', () => {
  let authService: AuthService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync(JwtModuleConfig),
        UserRepositoryModule,
        AuthTokenBlackListRepositoryModule,
        AuthRepositoryModule,
      ],
      providers: [
        AuthService,
        LocalIdStrategy,
        JwtStrategy,
        RolesGuard,
        AuthMapper,
        UserRepository,
        AuthRepository,
        AuthTokenBlackListRepository,
        AuthMapper,
        AuthService,
        AuthListener,
      ],
      controllers: [AuthController],
      exports: [RolesGuard],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);

    mailUserTest = configService.get<string>('MAIL_USER_TEST', 'user@mail.com');
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should throw HttpException if authEntity.activated is false', async () => {
    const authEntity: AuthEntity = MOCK.MOCK_authEntity;
    authEntity.password = await createPasswordHash(MOCK.MOCK_password);
    authEntity.activated = false;
    authEntity.disabled = false;

    jest
      .spyOn(authService['authRepository'], 'getEntityById')
      .mockResolvedValue(authEntity);

    await expect(
      authService.validateUser(
        'id',
        MOCK.MOCK_authEntity.id,
        MOCK.MOCK_password,
      ),
    ).rejects.toThrow('user not activated');
  });

  it('should throw HttpException if authEntity.disabled is true', async () => {
    const authEntity: AuthEntity = MOCK.MOCK_authEntity;
    authEntity.password = await createPasswordHash(MOCK.MOCK_password);
    authEntity.activated = true;
    authEntity.disabled = true;

    jest
      .spyOn(authService['authRepository'], 'getEntityById')
      .mockResolvedValue(authEntity);

    await expect(
      authService.validateUser(
        'id',
        MOCK.MOCK_authEntity.id,
        MOCK.MOCK_password,
      ),
    ).rejects.toThrow('user disabled');
  });

  it('should not throw HttpException if authEntity.disabled is false', async () => {
    const authEntity: AuthEntity = MOCK.MOCK_authEntity;
    authEntity.password = await createPasswordHash(MOCK.MOCK_password);
    authEntity.activated = true;
    authEntity.disabled = false;

    jest
      .spyOn(authService['authRepository'], 'getEntityById')
      .mockResolvedValue(authEntity);

    await expect(
      authService.validateUser(
        'id',
        MOCK.MOCK_authEntity.id,
        MOCK.MOCK_password,
      ),
    ).resolves.not.toThrow('user disabled');
  });
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync(JwtModuleConfig),
        UserRepositoryModule,
        AuthTokenBlackListRepositoryModule,
        AuthRepositoryModule,
      ],
      providers: [
        AuthService,
        LocalIdStrategy,
        JwtStrategy,
        RolesGuard,
        AuthMapper,
        UserRepository,
        AuthRepository,
        AuthTokenBlackListRepository,
        AuthMapper,
        AuthService,
        AuthListener,
        {
          provide: JwtService,
          useValue: {
            sign: jest
              .fn()
              .mockImplementation((payload) => `mockedToken.${payload.id}`),
          },
        },
      ],
      controllers: [AuthController],
      exports: [RolesGuard],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return signed token', async () => {
    const id = MOCK.MOCK_USER_ID_ADMIN;
    const expectedResult = {
      token: `mockedToken.${id}`,
    };
    const token = await authService.tokenRefresh(id, MOCK.MOCK_token);
    expect(token).toEqual(expectedResult);
  });

  it('should exception for user not found on signed token', async () => {
    await expect(
      authService.tokenRefresh(MOCK.MOCK_INVALID_USER, MOCK.MOCK_token),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('change password for invalid id', async () => {
    try {
      await authService.changePassword('0', MOCK.MOCK_password);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it(`change password user id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      await authService.changePassword(
        MOCK.MOCK_USER_ID_ADMIN,
        MOCK.MOCK_password,
      );
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`change password user id ${MOCK.MOCK_USER_ID_ADMIN} (Invalid password)`, async () => {
    try {
      await authService.changePassword(MOCK.MOCK_USER_ID_ADMIN, '');
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty(
        'message',
        'password must be longer than or equal to 8 characters',
      );
    }
  });

  it(`activate user id ${MOCK.MOCK_USER_ID_ADMIN} (Invalid activation)`, async () => {
    try {
      await authService.activate(MOCK.MOCK_USER_ID_ADMIN, 'activationToken');
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 401);
      expect(error).toHaveProperty('message', 'invalid activation token');
    }
  });

  it('activate user id invalid (Invalid activation)', async () => {
    try {
      await authService.activate('invalid', 'activationToken');
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it(`activate user id ${MOCK.MOCK_USER_ID_ADMIN} (Activation Ok)`, async () => {
    try {
      await authService.activate(
        MOCK.MOCK_USER_ID_ADMIN,
        MOCK.MOCK_activationToken,
      );
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`disabled user id ${MOCK.MOCK_USER_ID_USER}`, async () => {
    try {
      await authService.disableUser(
        MOCK.MOCK_userLoggedDto,
        MOCK.MOCK_USER_ID_USER,
      );
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('enabled user id 2', async () => {
    try {
      await authService.enableUser(MOCK.MOCK_userLoggedDto, '2');
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`validate user id invalid`, async () => {
    const resultado: UserDto = await authService.validateUser(
      'id',
      '',
      MOCK.MOCK_password,
    );
    expect(resultado).toBeNull();
  });

  it(`validate user id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    const resultado: UserDto = await authService.validateUser(
      'id',
      MOCK.MOCK_USER_ID_ADMIN,
      MOCK.MOCK_password,
    );
    expect(resultado).toHaveProperty('id', MOCK.MOCK_USER_ID_ADMIN);
  });

  it(`validate user id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    const resultado: UserDto = await authService.validateUser(
      'email',
      mailUserTest,
      MOCK.MOCK_password,
    );
    expect(resultado).toHaveProperty('id', MOCK.MOCK_USER_ID_ADMIN);
  });

  it(`validate user id ${MOCK.MOCK_USER_ID_USER} (Not activated)`, async () => {
    try {
      await authService.validateUser(
        'id',
        MOCK.MOCK_USER_ID_USER,
        MOCK.MOCK_password,
      );
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 401);
      expect(error).toHaveProperty('message', 'user not activated');
    }
  });

  it(`invalid password for user id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      await authService.validateUser(
        'id',
        MOCK.MOCK_USER_ID_ADMIN,
        'no-password',
      );
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'Unauthorized');
    }
  });

  it('Login User', async () => {
    const resultadoLogin = authService.login(MOCK.MOCK_userDto);
    expect(resultadoLogin).toHaveProperty('id', MOCK.MOCK_userDto.id);
    expect(resultadoLogin).toHaveProperty('token');
    expect(resultadoLogin).toHaveProperty('tokenRefresh');
  });

  it('Create User', async () => {
    const authEntity: AuthEntity = { ...MOCK.MOCK_authEntity };
    authEntity.id = 'test-create-user';

    try {
      await authService.createUser(MOCK.MOCK_userLoggedDto, authEntity);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('Delete User', async () => {
    try {
      await authService.deleteUser(MOCK.MOCK_userLoggedDto, 'test-create-user');
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('should logout', async () => {
    try {
      await authService.logout(MOCK.MOCK_token, MOCK.MOCK_tokenRefresh);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('Health', async () => {
    const healthResponseDto: HealthResponseDto = authService.checkHealth();
    expect(healthResponseDto).toHaveProperty('status', 'ok');
  });
});
