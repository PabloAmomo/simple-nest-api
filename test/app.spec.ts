import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthMapper } from '@contexts/auth/auth.mapper';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { AuthService } from '@contexts/auth/auth.service';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';
import { AuthTokenBlackListRepositoryModule } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list-repository.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@core/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '@contexts/user/user.controller';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserMapper } from '@contexts/user/user.mapper';
import { UserProfileService } from '@contexts/user/profile/user.profile.service';
import { UserRegisterService } from '@contexts/user/register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '@contexts/user/user.service';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';
import generateRandomToken from '@functions/generate-random-token.function';

let mailUserTest: string = '';

const USER_ENTITY_MOCK_CREATION: UserEntity = {
  ...MOCK.MOCK_userEntity,
  id: MOCK.MOCK_USER_ID_ADMIN,
  roles: [Role.Admin],
};

const AUTH_ENTITY_MOCK_CREATION: AuthEntity = {
  ...MOCK.MOCK_authEntity,
  id: MOCK.MOCK_USER_ID_ADMIN,
  password: MOCK.MOCK_password,
};

describe('AppInitialTest', () => {
  let userService: UserService;
  let authService: AuthService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
        AuthRepositoryModule,
        AuthTokenBlackListRepositoryModule,
      ],
      providers: [
        UserService,
        UserMapper,
        AuthMapper,
        UserRepository,
        UserRegisterService,
        UserProfileService,
        AuthRepository,
        AuthTokenBlackListRepository,
        AuthService,
        JwtService,
      ],
      controllers: [UserProfileService, UserRegisterService, UserController],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);

    mailUserTest = configService.get<string>('MAIL_USER_TEST', 'user@mail.com');
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it(`Verify and create user id ${MOCK.MOCK_USER_ID_ADMIN} (Role admin - Required for all test)`, async () => {
    try {
      await userService.createUser(MOCK.MOCK_userLoggedDto, {
        ...USER_ENTITY_MOCK_CREATION,
        id: MOCK.MOCK_USER_ID_ADMIN,
        email: mailUserTest,
        password: MOCK.MOCK_password,
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }

    try {
      await authService.createUser(MOCK.MOCK_userLoggedDto, {
        ...AUTH_ENTITY_MOCK_CREATION,
        id: MOCK.MOCK_USER_ID_ADMIN,
        activationToken: MOCK.MOCK_activationToken,
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it(`Verify and create user id ${MOCK.MOCK_USER_ID_USER} (Role user - Required for some test)`, async () => {
    try {
      await userService.createUser(MOCK.MOCK_userLoggedDto, {
        ...USER_ENTITY_MOCK_CREATION,
        id: MOCK.MOCK_USER_ID_USER,
        roles: [Role.User],
        email: mailUserTest,
        password: MOCK.MOCK_password,
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }

    try {
      await authService.createUser(MOCK.MOCK_userLoggedDto, {
        ...AUTH_ENTITY_MOCK_CREATION,
        id: MOCK.MOCK_USER_ID_USER,
        activationToken: generateRandomToken(MOCK.MOCK_USER_ID_USER),
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it(`Activate user ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      await authService.activate(
        MOCK.MOCK_USER_ID_ADMIN,
        MOCK.MOCK_activationToken,
      );
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });

  it(`Set user ${MOCK.MOCK_USER_ID_ADMIN} as admin (Required for all test)`, async () => {
    try {
      await userService.updateUser(
        MOCK.MOCK_userLoggedDto,
        MOCK.MOCK_USER_ID_ADMIN,
        {
          ...USER_ENTITY_MOCK_CREATION,
          id: MOCK.MOCK_USER_ID_ADMIN,
          email: mailUserTest,
          roles: [Role.Admin],
        },
      );
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it(`Set user ${MOCK.MOCK_USER_ID_ADMIN} password as '${MOCK.MOCK_password}' (Required for all test)`, async () => {
    try {
      await authService.changePassword(
        MOCK.MOCK_USER_ID_ADMIN,
        MOCK.MOCK_password,
      );
      expect(true).toBe(true);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
});
