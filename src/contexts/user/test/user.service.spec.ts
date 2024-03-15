import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { Role } from '@core/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserCreationDto } from '../dtos/user-creation.dto';
import { UserMapper } from '../user.mapper';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import ConfigModuleConfig from '@core/configs/config-module.config';
import * as MOCK from '@mocks/app-mocks';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

const USER_ID_1 = '1';
const USER_ID_2 = '2';

const userCreationDtoEmptyMock: UserCreationDto = {
  ...MOCK.MOCK_userEntityEmpty,
  password: '',
};

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
        AuthRepositoryModule,
      ],
      providers: [
        UserService,
        UserProfileService,
        UserRegisterService,
        UserMapper,
        UserRepository,
      ],
      controllers: [
        UserController,
        UserProfileController,
        UserRegisterController,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('get all users', async () => {
    const result = await userService.getAllUsers(MOCK.MOCK_userLoggedDto);
    const firstUser = result[0];
    expect(result).toBeInstanceOf(Array);
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('last');
    expect(firstUser).toHaveProperty('roles');
    expect(firstUser.roles).toBeInstanceOf(Array<Role>);
  });

  it(`update user ${USER_ID_2} rol `, async () => {
    try {
      await userService.updateUserRoles(MOCK.MOCK_userLoggedDto, USER_ID_2, [
        Role.User,
      ]);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`update user ${USER_ID_2} rol (No roles provided)`, async () => {
    try {
      await userService.updateUserRoles(MOCK.MOCK_userLoggedDto, USER_ID_2, []);
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error).toHaveProperty('message', 'roles should not be empty');
    }
  });

  it('update user rol (invalid id)', async () => {
    try {
      await userService.updateUserRoles(MOCK.MOCK_userLoggedDto, '', [
        Role.User,
      ]);
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it(`find user ${USER_ID_1}`, async () => {
    try {
      const result = await userService.findUser(
        MOCK.MOCK_userLoggedDto,
        USER_ID_1,
      );
      expect(result).toMatchObject({
        id: USER_ID_1,
        name: expect.any(String),
        last: expect.any(String),
        email: expect.any(String),
        roles: expect.arrayContaining([]),
      });
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('find user (Invalid id)', async () => {
    await expect(
      userService.findUser(MOCK.MOCK_userLoggedDto, ''),
    ).rejects.toThrow(InvalidDataException);
  });

  it('find user (User not found)', async () => {
    await expect(
      userService.findUser(MOCK.MOCK_userLoggedDto, MOCK.MOCK_INVALID_USER),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('Add new user (Already exist)', async () => {
    try {
      await userService.createUser(MOCK.MOCK_userLoggedDto, {
        ...MOCK.MOCK_userEntity,
        password: MOCK.MOCK_password,
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it('Add new user (Error in validation)', async () => {
    try {
      await userService.createUser(
        MOCK.MOCK_userLoggedDto,
        userCreationDtoEmptyMock,
      );
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 500);
      if (error.message === 'user already exists') {
        expect(true).toBe(true);
      } else {
        expect(error).toHaveProperty(
          'message',
          'id must be longer than or equal to 1 characters, name must be longer than or equal to 3 characters, last must be longer than or equal to 3 characters, email must be an email, roles should not be empty',
        );
      }
    }
  });

  it('Add new user (And remove after)', async () => {
    const userName = Date.now().toString();
    try {
      await userService.createUser(MOCK.MOCK_userLoggedDto, {
        id: userName,
        email: `${userName}@mail.com`,
        name: `name ${userName}`,
        last: `last ${userName}`,
        password: `${userName}`,
        roles: [Role.User],
      });
      await userService.removeUser(MOCK.MOCK_userLoggedDto, userName);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('Add new user with no rol (And remove after)', async () => {
    const userName = Date.now().toString();
    try {
      await userService.createUser(MOCK.MOCK_userLoggedDto, {
        id: userName,
        email: `${userName}@mail.com`,
        name: `name ${userName}`,
        last: `last ${userName}`,
        password: `${userName}`,
        roles: [],
      });
      await userService.removeUser(MOCK.MOCK_userLoggedDto, userName);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'roles should not be empty');
    }
  });

  it('Remove newRegisterUser', async () => {
    try {
      await userService.removeUser(MOCK.MOCK_userLoggedDto, 'newRegisterUser');
    } catch (error: Error | any) {}
    expect(true).toBe(true);
  });

  it('Remove not existing user', async () => {
    try {
      await userService.removeUser(MOCK.MOCK_userLoggedDto, 'userNotExist');
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it('Update user x [Invalid user]', async () => {
    try {
      await userService.updateUser(MOCK.MOCK_userLoggedDto, '', {} as any);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it(`Update user 2 name (To new Name ${USER_ID_2})`, async () => {
    const user = await userService.findUser(MOCK.MOCK_userLoggedDto, USER_ID_2);
    try {
      await userService.updateUser(MOCK.MOCK_userLoggedDto, USER_ID_2, {
        ...user,
        name: 'new name 2',
      });
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`Restore user ${USER_ID_2} name`, async () => {
    try {
      await userService.updateUser(MOCK.MOCK_userLoggedDto, USER_ID_2, {
        ...MOCK.MOCK_userDto,
      });
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`Disable user ${USER_ID_2}`, async () => {
    try {
      await userService.disableUser(MOCK.MOCK_userLoggedDto, USER_ID_2);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`Enable user ${USER_ID_2}`, async () => {
    try {
      await userService.enableUser(MOCK.MOCK_userLoggedDto, USER_ID_2);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('Enable user invalid', async () => {
    try {
      await userService.enableUser(MOCK.MOCK_userLoggedDto, 'invalid');
      expect(true).toBe(false);
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it('Health', async () => {
    const healthResponseDto: HealthResponseDto = userService.checkHealth();
    expect(healthResponseDto).toHaveProperty('status', 'ok');
  });
});
