import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { ResourceNotFound } from '@core/exceptions/resource-not-found.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from '../user.mapper';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UserProfileImageUploadResponseDto } from '../dtos/user-profile-image-upload-response.dto';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import * as fs from 'fs';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';
import parseFileName from '@functions/parse-file-name.function';

let mailUserTest: string = '';

describe('userProfileService (Mocked Service for Upload test)', () => {
  let userProfileService: UserProfileService;
  let configService: ConfigService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        UserProfileService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue(MOCK.MOCK_UPLOAD_PROFILE_IMAGES_PATH),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getEntityById: jest.fn().mockResolvedValue({ profileImage: '' }),
            saveEntity: jest.fn().mockResolvedValue({}),
          },
        },
        UserMapper,
      ],
    }).compile();

    userProfileService = module.get<UserProfileService>(UserProfileService);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<UserRepository>(UserRepository);

    mailUserTest = configService.get<string>('MAIL_USER_TEST', 'user@mail.com');
  });

  it('should upload image', async () => {
    const userLogged: UserLoggedDto = MOCK.MOCK_userLoggedDto;
    const imageMock = {
      originalname: 'test-image.jpg',
      buffer: Buffer.from('test-image-buffer'),
    };

    const responseMock: UserProfileImageUploadResponseDto = {
      name: imageMock.originalname,
    };
    const result: UserProfileImageUploadResponseDto =
      await userProfileService.uploadImage(
        userLogged,
        imageMock as Express.Multer.File,
      );

    expect(configService.get).toHaveBeenCalledWith(
      'PROFILE_UPLOAD_IMAGE_PATH',
      'uploads/profiles',
    );
    expect(userRepository.getEntityById).toHaveBeenCalledWith(userLogged.id);
    expect(userRepository.saveEntity).toHaveBeenCalledWith(
      userLogged,
      expect.objectContaining({
        profileImage: `${MOCK.MOCK_UPLOAD_PROFILE_IMAGES_PATH}/profile-user-${parseFileName(userLogged.id, 100)}.jpg`,
      }),
    );
    expect(result).toEqual(responseMock);
  });
});

describe('UserService', () => {
  let userProfileService: UserProfileService;
  let configService: ConfigService;

  beforeAll(async () => {
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
      ],
      controllers: [
        UserController,
        UserProfileController,
        UserRegisterController,
      ],
    }).compile();

    userProfileService = module.get<UserProfileService>(UserProfileService);
    configService = module.get<ConfigService>(ConfigService);
    mailUserTest = configService.get<string>('MAIL_USER_TEST', 'user@mail.com');
  });

  it('should be defined', () => {
    expect(userProfileService).toBeDefined();
  });

  it('Health', async () => {
    const healthResponseDto: HealthResponseDto =
      userProfileService.checkHealth();
    expect(healthResponseDto).toHaveProperty('status', 'ok');
  });

  it(`getPathForImage for profile user ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      const response: string = await userProfileService.getPathForImage(
        MOCK.MOCK_USER_ID_ADMIN,
      );
      expect(response.indexOf('profile-user-1.jpg')).toBeGreaterThan(-1);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`downloadImage for profile user ${MOCK.MOCK_USER_ID_ADMIN} must return ReadStream`, async () => {
    try {
      const readStream: ReadStream = await userProfileService.downloadImage(
        MOCK.MOCK_USER_ID_ADMIN,
      );
      expect(readStream).toBeInstanceOf(ReadStream);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`getImage for profile user ${MOCK.MOCK_USER_ID_ADMIN} must return Buffer`, async () => {
    try {
      const buffer: Buffer = await userProfileService.getImage(
        MOCK.MOCK_USER_ID_ADMIN,
      );
      expect(buffer).toBeInstanceOf(Buffer);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('getPathForImage for profile user invalid', async () => {
    try {
      await userProfileService.getPathForImage('');
      expect(false).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(true);
    }
  });

  it(`Get profile for id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      const profile: UserProfileDto = await userProfileService.getProfile(
        MOCK.MOCK_USER_ID_ADMIN,
      );
      expect(profile).toHaveProperty('id', MOCK.MOCK_USER_ID_ADMIN);
      expect(['email', 'name', 'last'].every((p) => p in profile)).toBe(true);
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it('Update invalid profile id', async () => {
    try {
      await userProfileService.updateProfile(
        MOCK.MOCK_userLoggedDto,
        '',
        MOCK.MOCK_userProfileDtoEmpty,
      );
    } catch (error: Error | any) {
      expect(error).toBeInstanceOf(UserNotFoundException);
    }
  });

  it(`Update invalid profile data for id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      await userProfileService.updateProfile(
        MOCK.MOCK_userLoggedDto,
        MOCK.MOCK_USER_ID_ADMIN,
        MOCK.MOCK_userProfileDtoEmpty,
      );
    } catch (error: Error | any) {
      expect(error).toHaveProperty('status', 500);
      expect(error).toHaveProperty(
        'message',
        'name must be longer than or equal to 3 characters, last must be longer than or equal to 3 characters, email must be an email',
      );
    }
  });

  it(`Update profile data for id ${MOCK.MOCK_USER_ID_ADMIN}`, async () => {
    try {
      await userProfileService.updateProfile(
        MOCK.MOCK_userLoggedDto,
        MOCK.MOCK_USER_ID_ADMIN,
        {
          id: MOCK.MOCK_userEntity.id,
          name: MOCK.MOCK_userEntity.name,
          last: MOCK.MOCK_userEntity.last,
          email: mailUserTest,
        },
      );
      expect(true).toBe(true);
    } catch (error: Error | any) {
      expect(true).toBe(false);
    }
  });

  it(`getImage (First Step)  for profile user mocking getPathForImage to produce throw invalid resorce`, async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    await expect(
      userProfileService.getPathForImage(MOCK.MOCK_USER_ID_ADMIN),
    ).rejects.toThrow(ResourceNotFound);
  });

  /** The order is important, because in first step we are mocking the getPathForImage */
  it(`getImage (Second Step) for profile user mocking getImage to produce throw invalid resorce`, async () => {
    jest
      .spyOn(userProfileService, 'getPathForImage')
      .mockReturnValue(Promise.resolve(''));
    await expect(
      userProfileService.getImage(MOCK.MOCK_USER_ID_ADMIN),
    ).rejects.toThrow(ResourceNotFound);
  });
});
