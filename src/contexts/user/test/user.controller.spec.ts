import { AuthGuard } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Role } from '@core/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from '../user.mapper';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

const userLogged: UserLoggedDto = { ...MOCK.MOCK_userLoggedDto, id: '1' };

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
      ],
      providers: [
        UserProfileService,
        UserRegisterService,
        UserMapper,
        UserRepository,
        {
          provide: UserService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
            createUser: jest.fn().mockResolvedValue(undefined),
            updateUserRoles: jest.fn().mockResolvedValue(undefined),
            enableUser: jest.fn().mockResolvedValue(undefined),
            disableUser: jest.fn().mockResolvedValue(undefined),
            updateUser: jest.fn().mockResolvedValue(undefined),
            findUser: jest.fn().mockResolvedValue(MOCK.MOCK_userDto),
            getAllUsers: jest.fn().mockResolvedValue([MOCK.MOCK_userDto]),
            removeUser: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
      controllers: [
        UserProfileController,
        UserRegisterController,
        UserController,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should check health', async () => {
    expect(userController.checkHealth()).toBe('service response');
    expect(userService.checkHealth).toHaveBeenCalled();
  });

  it('should createUser', async () => {
    jest.spyOn(userService, 'createUser').mockResolvedValueOnce();

    await userController.createUser(
      MOCK.MOCK_userReqUserCreationDto,
      userLogged,
    );

    expect(userService.createUser).toHaveBeenCalledWith(
      userLogged,
      MOCK.MOCK_userCreationDto,
    );
  });

  it('should updateUserRoles', async () => {
    jest.spyOn(userService, 'updateUserRoles').mockResolvedValueOnce();

    await userController.updateUserRoles(userLogged, MOCK.MOCK_userDto.id, [
      Role.User,
    ]);

    expect(userService.updateUserRoles).toHaveBeenCalledWith(
      userLogged,
      MOCK.MOCK_userDto.id,
      [Role.User],
    );
  });

  it('should updateUser', async () => {
    jest.spyOn(userService, 'updateUser').mockResolvedValueOnce();

    await userController.updateUser(
      userLogged,
      MOCK.MOCK_userDto.id,
      MOCK.MOCK_userDto,
    );

    expect(userService.updateUser).toHaveBeenCalledWith(
      userLogged,
      MOCK.MOCK_userDto.id,
      MOCK.MOCK_userDto,
    );
  });

  it('should getAllUsers', async () => {
    jest
      .spyOn(userService, 'getAllUsers')
      .mockResolvedValueOnce([MOCK.MOCK_userDto]);

    const result = await userController.getAllUsers(MOCK.MOCK_userLoggedDto);

    expect(result).toEqual([MOCK.MOCK_userDto]);
    expect(userService.getAllUsers).toHaveBeenCalledWith(
      MOCK.MOCK_userLoggedDto,
    );
  });

  ['findUser', 'enableUser', 'disableUser', 'removeUser'].forEach(
    (method: any) => {
      it(`should ${method}`, async () => {
        jest.spyOn(userService, method).mockResolvedValueOnce({});

        await userController[method](userLogged, MOCK.MOCK_userDto.id);

        expect(userService[method]).toHaveBeenCalledWith(
          userLogged,
          MOCK.MOCK_userDto.id,
        );
      });
    },
  );

  [
    'updateUserRoles',
    'enableUser',
    'disableUser',
    'updateUser',
    'findUser',
    'removeUser',
  ].forEach((method) => {
    it(`should ${method} (invalid user id)`, async () => {
      try {
        userController[method](userLogged, '', MOCK.MOCK_userDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidDataException);
        expect(error.message).toBe('invalid id');
      }
    });
  });
});
