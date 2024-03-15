import { ConfigModule } from '@nestjs/config';
import { DomainEvents } from '@core/events/domain-events';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { Role } from '@core/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { UserController } from '../user.controller';
import { UserMapper } from '../user.mapper';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserRegisteredEvent } from '@core/events/user/user-registered.event';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';

const USER_EVENT = 'user.added.event';

const userRegisterDtoNewMock: UserRegisterDto = {
  id: `newRegisterUser`,
  ...MOCK.MOCK_userEntity,
  password: MOCK.MOCK_password,
};

describe('UserRegisterService', () => {
  let userRegisterService: UserRegisterService;
  let eventEmitterMock: Partial<EventEmitter2>;
  let userRepository: UserRepository;

  beforeAll(async () => {
    eventEmitterMock = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserRepositoryModule,
      ],
      providers: [
        UserService,
        UserProfileService,
        UserRegisterService,
        UserMapper,
        UserRepository,
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
      ],
      controllers: [
        UserController,
        UserProfileController,
        UserRegisterController,
      ],
    }).compile();

    userRegisterService = module.get<UserRegisterService>(UserRegisterService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRegisterService).toBeDefined();
  });

  it('Register new user (Error in validation)', async () => {
    const userToRegister: UserRegisterDto = {
      ...userRegisterDtoNewMock,
      name: '',
      id: '',
    };
    try {
      await userRegisterService.registerUser(
        MOCK.MOCK_userLoggedDto,
        userToRegister,
      );
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty(
        'message',
        'id must be longer than or equal to 1 characters, name must be longer than or equal to 3 characters',
      );
    }
  });

  it(`Register new user (${userRegisterDtoNewMock.id})`, async () => {
    try {
      await userRegisterService.registerUser(
        MOCK.MOCK_userLoggedDto,
        userRegisterDtoNewMock,
      );
      expect(true).toBe(true);
    } catch (error: any) {
      if (error.status === 500 && error.message === 'user already exists') {
        expect(true).toBe(true);
      } else {
        expect(true).toBe(false);
      }
    }
  });

  it('Register new user (Already exist)', async () => {
    try {
      await userRegisterService.registerUser(
        MOCK.MOCK_userLoggedDto,
        userRegisterDtoNewMock,
      );
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it('Register new user (Not user logged)', async () => {
    try {
      await userRegisterService.registerUser(null, userRegisterDtoNewMock);
    } catch (error) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty('message', 'user already exists');
    }
  });

  it('Register event test', async () => {
    // Act
    await userRegisterService.registerUser(MOCK.MOCK_userLoggedDto, {
      ...MOCK.MOCK_userRegisterDto,
      id: USER_EVENT,
    });

    const userAddedEvent: UserAddedEvent = {
      id: USER_EVENT,
      password: MOCK.MOCK_userRegisterDto.password,
      userLogged: MOCK.MOCK_userLoggedDto,
      activationToken: expect.any(String),
    };
    const userRegisteredEvent: UserRegisteredEvent = {
      id: USER_EVENT,
      email: MOCK.MOCK_userRegisterDto.email,
      name: MOCK.MOCK_userRegisterDto.name,
      last: MOCK.MOCK_userRegisterDto.last,
      roles: [Role.User],
      userLogged: MOCK.MOCK_userLoggedDto,
      activationToken: expect.any(String),
    };

    expect(eventEmitterMock.emit).toHaveBeenNthCalledWith(
      1,
      DomainEvents.USER_ADDED_EVENT,
      expect.objectContaining(userAddedEvent),
    );
    expect(eventEmitterMock.emit).not.toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ token: '' }),
    );

    expect(eventEmitterMock.emit).toHaveBeenNthCalledWith(
      2,
      DomainEvents.USER_REGISTERED_EVENT,
      expect.objectContaining(userRegisteredEvent),
    );
    expect(eventEmitterMock.emit).not.toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ token: '' }),
    );
  });

  it(`Remove event test user ${USER_EVENT}`, async () => {
    try {
      await userRepository.deleteEntity(MOCK.MOCK_userLoggedDto, USER_EVENT);
      expect(true).toBe(true);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it('Health', async () => {
    const healthResponseDto: HealthResponseDto =
      userRegisterService.checkHealth();
    expect(healthResponseDto).toHaveProperty('status', 'ok');
  });
});
