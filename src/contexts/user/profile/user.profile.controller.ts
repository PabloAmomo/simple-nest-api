import {
  Controller,
  Get,
  Body,
  UseGuards,
  Put,
  HttpCode,
  Post,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
  Header,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from '@core/interceptors/file-upload.interceptor';
import { RolesGuard } from '@core/guards/roles.guard';
import { UserLogged } from '@core/decorators/user-logged.decorator';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserMapper } from '../user.mapper';
import { ApiUserProfileDto, UserProfileDto } from '../dtos/user-profile.dto';
import { UserProfileService } from './user.profile.service';
import {
  ApiUserReqUserProfileDto,
  UserReqUserProfileDto,
} from '../dtos/user-req-user-profile.dto';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { Response } from 'express';
import { DEFAULT_VALID_IMAGE_EXTENSIONS } from '@core/constants/constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiHealthResponseDto,
  HealthResponseDto,
} from '@core/dtos/health/health-response.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import {
  ApiUserProfileImageUploadResponseDto,
  UserProfileImageUploadResponseDto,
} from '../dtos/user-profile-image-upload-response.dto';
import { ApiUserProfileImageResponseDto } from '../dtos/user-profile-image-response.dto';

@ApiTags('user/profile')
@Controller('user/profile')
export class UserProfileController {
  constructor(
    private userProfileService: UserProfileService,
    private userMapper: UserMapper,
  ) {}

  /** Health check */
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'health check',
    schema: ApiHealthResponseDto,
  })
  @HttpCode(200)
  checkHealth(): HealthResponseDto {
    return this.userProfileService.checkHealth();
  }

  /** Download user profile image */
  @Get('/image/download')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user profile image' })
  @ApiOperation({ summary: 'Download user profile image' })
  @Header('Content-disposition', 'attachment; filename=profile.jpg')
  async downloadImage(@UserLogged() userLogged: UserLoggedDto) {
    const id: string = userLogged?.id;
    if (!id) throw new UserNotFoundException();

    const image: ReadStream = await this.userProfileService.downloadImage(id);
    return new StreamableFile(image);
  }

  /** Update user profile image */
  @Post('/image')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(
    FileInterceptor('image'),
    new FileUploadInterceptor(
      'PROFILE_MAX_IMAGE_SIZE',
      DEFAULT_VALID_IMAGE_EXTENSIONS,
    ),
  )
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({
    description: 'user profile image uploaded',
    schema: ApiUserProfileImageUploadResponseDto,
  })
  @ApiOperation({ summary: 'Upload user profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: ApiUserProfileImageResponseDto })
  uploadImage(
    @UserLogged() userLogged: UserLoggedDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UserProfileImageUploadResponseDto> {
    return this.userProfileService.uploadImage(userLogged, image);
  }

  /** Get user profile */
  @Get('/image')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOkResponse({ description: 'user profile image' })
  @ApiOperation({ summary: 'Get user profile image' })
  async getFile(@UserLogged() userLogged: UserLoggedDto, @Res() res: Response) {
    const id: string = userLogged?.id ?? '';
    if (!id) throw new UserNotFoundException();

    const image: Buffer = await this.userProfileService.getImage(id);

    res.set('Content-Type', 'image/jpeg');
    res.send(image);
  }

  /** Get user profile */
  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({
    description: 'user profile',
    schema: ApiUserProfileDto,
  })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@UserLogged() userLogged: UserLoggedDto): Promise<UserProfileDto> {
    return this.userProfileService.getProfile(userLogged.id);
  }

  /** Update user profile */
  @Put()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ description: 'user profile updated' })
  @ApiUnauthorizedResponse({ description: 'invalid token' })
  @ApiBody({
    description: 'user profile data to update',
    schema: ApiUserReqUserProfileDto,
  })
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  updateProfile(
    @UserLogged() userLogged: UserLoggedDto,
    @Body() user: UserReqUserProfileDto,
  ): Promise<void> {
    const id: string = userLogged?.id;
    const userProfileDto: UserProfileDto =
      this.userMapper.userReqUserProfileDtoToUserProfileDto(user, id);

    return this.userProfileService.updateProfile(
      userLogged,
      id,
      userProfileDto,
    );
  }
}
