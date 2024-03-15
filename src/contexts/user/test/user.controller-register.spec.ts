import { AuthGuard } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from '../user.mapper';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('UserRegisterController Base', () => {
  let userRegisterController: UserRegisterController;
  let userRegisterService: UserRegisterService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
      ],
      providers: [
        UserRegisterService,
        UserMapper,
        UserRepository,
        {
          provide: UserRegisterService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
            registerUser: jest.fn().mockResolvedValue(null),
          },
        },
      ],
      controllers: [UserRegisterController],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    userRegisterController = module.get<UserRegisterController>(
      UserRegisterController,
    );
    userRegisterService = module.get<UserRegisterService>(UserRegisterService);
  });

  it('should be defined', () => {
    expect(userRegisterController).toBeDefined();
  });

  it('should check health', async () => {
    expect(userRegisterController.checkHealth()).toBe('service response');
    expect(userRegisterService.checkHealth).toHaveBeenCalled();
  });
});

describe('UserRegisterController Extended', () => {
  let userRegisterController: UserRegisterController;
  let userRegisterService: UserRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
      ],
      providers: [
        UserRegisterService,
        UserMapper,
        UserRepository,
        {
          provide: UserRegisterService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
            registerUser: jest.fn().mockResolvedValue(null),
          },
        },
      ],
      controllers: [UserRegisterController],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    userRegisterController = module.get<UserRegisterController>(
      UserRegisterController,
    );
    userRegisterService = module.get<UserRegisterService>(UserRegisterService);
  });

  it('should registerUser', async () => {
    const controllerResponse: void = await userRegisterController.registerUser(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserRegisterDto,
    );
    expect(controllerResponse).toBeNull();

    jest.spyOn(userRegisterController, 'registerUser').mockResolvedValueOnce();

    await userRegisterService.registerUser(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserRegisterDto,
    );
    expect(userRegisterService.registerUser).toHaveBeenCalledWith(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserRegisterDto,
    );
  });

  it('should registerUser (Check no loggedUser)', async () => {
    const controllerResponse: void = await userRegisterController.registerUser(
      undefined as UserLoggedDto,
      MOCK.MOCK_userReqUserRegisterDto,
    );
    expect(controllerResponse).toBe(null);

    jest.spyOn(userRegisterController, 'registerUser').mockResolvedValueOnce();

    await userRegisterService.registerUser(
      undefined as UserLoggedDto,
      MOCK.MOCK_userReqUserRegisterDto,
    );
    expect(userRegisterService.registerUser).toHaveBeenCalledWith(
      undefined as any,
      MOCK.MOCK_userReqUserRegisterDto,
    );
  });
});
