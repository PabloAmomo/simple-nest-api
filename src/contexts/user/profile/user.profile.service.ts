import { ConfigService } from '@nestjs/config';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { Injectable } from '@nestjs/common';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { ResourceNotFound } from '@core/exceptions/resource-not-found.exception';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from '../user.mapper';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import * as fs from 'fs';
import * as path from 'path';
import getCheckHealth from '@functions/get-health-response.function';
import parseFileName from '@functions/parse-file-name.function';
import saveFile from '@functions/save-file.function';
import { UserProfileImageUploadResponseDto } from '../dtos/user-profile-image-upload-response.dto';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private userMapper: UserMapper,
    private configService: ConfigService,
  ) {}

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }

  async getPathForImage(id: string): Promise<string> {
    const userEntity = await this.userRepository.getEntityById(id);
    if (!userEntity) throw new ResourceNotFound('image not found');

    const imagePath: string = path.resolve(
      process.cwd(),
      userEntity.profileImage,
    );

    const fileExist = fs.existsSync(imagePath);
    if (!fileExist) throw new ResourceNotFound('image not found');

    return imagePath;
  }

  async downloadImage(id: string): Promise<ReadStream> {
    const imagePath = await this.getPathForImage(id);
    return fs.createReadStream(imagePath);
  }

  async getImage(id: string): Promise<Buffer> {
    const imagePath = await this.getPathForImage(id);
    if (!imagePath) throw new ResourceNotFound('image not found');
    return fs.readFileSync(imagePath);
  }

  async uploadImage(
    userLogged: UserLoggedDto,
    image: Express.Multer.File,
  ): Promise<UserProfileImageUploadResponseDto> {
    const id = userLogged.id;

    const profileUploadImagePath = this.configService.get<string>(
      'PROFILE_UPLOAD_IMAGE_PATH',
      'uploads/profiles',
    );
    const uploadPath = path.join(process.cwd(), profileUploadImagePath);
    const extension = path.extname(image.originalname);
    const name = parseFileName(`profile-user-${id}`, 100);
    const filename = `${name}${extension}`;

    const savedFilename = await saveFile(uploadPath, filename, image.buffer);
    const fullName = `${profileUploadImagePath}/${savedFilename}`;

    const user: UserEntity = await this.userRepository.getEntityById(id);
    user.profileImage = fullName;
    this.userRepository.saveEntity(userLogged, user);

    return { name: image.originalname };
  }

  async getProfile(id: string): Promise<UserProfileDto> {
    const user: UserEntity = await this.userRepository.getEntityById(id);
    return this.userMapper.userEntityToUserProfileDto(user);
  }

  async updateProfile(
    userLogged: UserLoggedDto,
    id: string,
    user: UserProfileDto,
  ) {
    const userToUpdate: UserEntity =
      await this.userRepository.getEntityById(id);

    if (!userToUpdate) throw new UserNotFoundException();

    const userUpdated =
      await this.userMapper.userEntityUpdateFromUserProfileDto(
        userToUpdate,
        user,
      );

    await this.userRepository.updateEntity(userLogged, id, userUpdated);
  }
}
