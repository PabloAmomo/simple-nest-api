import { AuthGuard } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Response } from 'express';
import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from '../user.mapper';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UserProfileImageUploadResponseDto } from '../dtos/user-profile-image-upload-response.dto';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('UserProfileController', () => {
  let userProfileController: UserProfileController;
  let userProfileService: UserProfileService;

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
        UserMapper,
        UserRepository,
        {
          provide: UserProfileService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
            getProfile: jest.fn().mockResolvedValue(MOCK.MOCK_userProfileDto),
            updateProfile: jest.fn().mockResolvedValue(null),
            uploadImage: jest.fn().mockResolvedValue({ name: 'file' }),
            getImage: jest.fn().mockResolvedValue(Buffer.from('test-image')),
            downloadImage: jest.fn().mockResolvedValue('test-image-stream'),
          },
        },
      ],
      controllers: [UserProfileController],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    userProfileController = module.get<UserProfileController>(
      UserProfileController,
    );
    userProfileService = module.get<UserProfileService>(UserProfileService);
  });

  it('should be defined', () => {
    expect(userProfileController).toBeDefined();
  });

  it('should check health', async () => {
    expect(userProfileController.checkHealth()).toBe('service response');
    expect(userProfileService.checkHealth).toHaveBeenCalled();
  });

  it('should getProfile', async () => {
    const controllerResponse: UserProfileDto =
      await userProfileController.getProfile(MOCK.MOCK_userLoggedDto);
    expect(controllerResponse).toEqual(MOCK.MOCK_userProfileDto);

    jest
      .spyOn(userProfileController, 'getProfile')
      .mockResolvedValueOnce(MOCK.MOCK_userProfileDto);

    await userProfileService.getProfile(MOCK.MOCK_userLoggedDto.id);
    expect(userProfileService.getProfile).toHaveBeenCalledWith(
      MOCK.MOCK_userLoggedDto.id,
    );
  });

  it('should updateProfile', async () => {
    const controllerResponse: void = await userProfileController.updateProfile(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserProfileDto,
    );
    expect(controllerResponse).toEqual(null);

    jest.spyOn(userProfileController, 'updateProfile').mockResolvedValueOnce();

    await userProfileController.updateProfile(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserProfileDto,
    );

    expect(userProfileController.updateProfile).toHaveBeenCalledWith(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_userReqUserProfileDto,
    );
  });

  it('should upload a file', async () => {
    const MOCK_DATA: UserProfileImageUploadResponseDto = { name: 'file' };
    jest
      .spyOn(userProfileService, 'uploadImage')
      .mockResolvedValueOnce(MOCK_DATA);

    const controllerResponse: UserProfileImageUploadResponseDto =
      await userProfileController.uploadImage(
        MOCK.MOCK_userLoggedDto,
        MOCK.MOCK_profileImageUpload,
      );
    expect(controllerResponse).toEqual(MOCK_DATA);

    await userProfileController.uploadImage(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_profileImageUpload,
    );

    expect(userProfileService.uploadImage).toHaveBeenCalledWith(
      MOCK.MOCK_userLoggedDto,
      MOCK.MOCK_profileImageUpload,
    );
  });

  it('should return image with appropriate content type', async () => {
    const responseMock = {
      set: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    await userProfileController.getFile(MOCK.MOCK_userLoggedDto, responseMock);

    expect(responseMock.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    expect(responseMock.send).toHaveBeenCalledWith(Buffer.from('test-image'));
  });

  it('should return exception if userLogged is null', async () => {
    const responseMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    } as unknown as Response;

    await expect(
      userProfileController.getFile(null, responseMock),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should return a StreamableFile object (downloadImage)', async () => {
    await expect(
      userProfileController.downloadImage(MOCK.MOCK_userLoggedDto),
    ).resolves.toBeInstanceOf(StreamableFile);
  });

  it('should return exception if userLogged is null (downloadImage)', async () => {
    await expect(userProfileController.downloadImage(null)).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
