import { AuthActivatedEvent } from '@core/events/auth/auth-activated.event';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthJwtTokenDto } from '@core/dtos/auth/auth-jwt-token.dto';
import { AuthReqLoginEmailDto } from '@contexts/auth/dtos/auth-req-login-email.dto';
import { AuthReqLoginIdDto } from '@contexts/auth/dtos/auth-req-login-id.dto';
import { GeneralException } from '@core/exceptions/general.exception';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { Role } from '@core/enums/role.enum';
import { UnauthorizedException } from '@nestjs/common';
import { UserActivatedEvent } from '@core/events/user/user-activated.event';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { UserAddedEventDto } from '@core/dtos/user/user-added-event.dto';
import { UserCreatedEvent } from '@core/events/user/user-created.event';
import { UserCreationDto } from '@contexts/user/dtos/user-creation.dto';
import { UserDeletedEvent } from '@core/events/user/user-deleted.event';
import { UserDeletedEventDto } from '@core/dtos/user/user-deleted-event.dto';
import { UserDisabledEvent } from '@core/events/user/user-disabled.event';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { UserEnabledEvent } from '@core/events/user/user-enabled.event';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import { UserProfileDto } from '@contexts/user/dtos/user-profile.dto';
import { UserRegisterDto } from '@contexts/user/dtos/user-register.dto';
import { UserRegisteredEvent } from '@core/events/user/user-registered.event';
import { UserRegisteredEventDto } from '@core/dtos/user/user-registered-event.dto';
import { UserReqUserCreationDto } from '@contexts/user/dtos/user-req-user-creation.dto';
import { UserReqUserDto } from '@contexts/user/dtos/user-req-user.dto';
import { UserReqUserProfileDto } from '@contexts/user/dtos/user-req-user-profile.dto';
import { UserReqUserRegisterDto } from '@contexts/user/dtos/user-req-user-register.dto';
import generateRandomToken from '@functions/generate-random-token.function';
import { AuthTokenBlackListEntity } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.entity';

export const MOCK_password = 'password';

export const MOCK_UPLOAD_PROFILE_IMAGES_PATH = '_uploads/profiles';

export const MOCK_INVALID_USER = 'invalid-user';
export const MOCK_USER_ID_ADMIN = '1';
export const MOCK_USER_ID_USER = '2';

export const MOCK_USER_TEST_1 = 'test-1';
export const MOCK_USER_TEST_2 = 'test-2';
export const MOCK_INVALID_SHORT_PASSWORD = '123';

export const MOCK_HTTP_STATUS_OK = 200;
export const MOCK_HTTP_STATUS_CREATED = 201;
export const MOCK_HTTP_STATUS_NOT_FOUND = 404;

export const MOCK_EXCEPTION_INVALID_DATA = new InvalidDataException('');
export const MOCK_EXCEPTION_USER_NOT_FOUND = new UserNotFoundException();
export const MOCK_EXCEPTION_GENERAL = new GeneralException('');
export const MOCK_EXCEPTION_UNAUTHORIZED = new UnauthorizedException();

export const MOCK_activationToken =
  '1234567890123456789012345678901234567890123456789012345678901234';

export const MOCK_token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE3MDk0OTYzMTIsImV4cCI6MTcwOTQ5OTkxMn0.LjLz_-xebEw1WMY1rKYBEIRvBovwZpLWPI4gPnAhFy4';

export const MOCK_tokenRefresh =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE3MDk0OTYzMTIsImV4cCI6MTcxMDEwMTExMn0.eSxL4CWKqnY-m9kLqS6DefviEoz2VKW0A6_VOrv0mUI';

export const MOCK_userEntity: UserEntity = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  last: 'Doe',
  profileImage: 'image.jpg',
  roles: [Role.User],
};

export const MOCK_authTokenBlackListEntity: AuthTokenBlackListEntity = {
  token: MOCK_token,
};

export const MOCK_BASIC_EMPTY_DATA = {
  id: '',
  name: '',
  last: '',
  email: '',
};

export const MOCK_authEntity: AuthEntity = {
  id: MOCK_userEntity.id,
  password: '',
  activated: false,
  activationToken: generateRandomToken('hey'),
};

export const MOCK_welcomeEmail = (email: string, name: string) => ({
  to: email,
  subject: `Welcome ${name}`,
  template: 'welcome',
  context: {
    name: name,
    activationToken: MOCK_activationToken,
    id: MOCK_userEntity.id,
    activationUrl: `http://localhost:3000/${MOCK_userEntity.id}/activate?activationToken=${MOCK_activationToken}`,
  },
});

export const MOCK_CREATE_USER_EMPTY = {
  ...MOCK_BASIC_EMPTY_DATA,
  password: '',
  roles: null,
};

export const MOCK_authJwtTokenDto: AuthJwtTokenDto = {
  id: MOCK_authEntity.id,
  iat: 1,
  exp: 1,
};

export const MOCK_userEntityEmpty: UserEntity = {
  ...MOCK_BASIC_EMPTY_DATA,
  profileImage: '',
  roles: [],
};

export const MOCK_userDtoEmpty: UserDto = {
  ...MOCK_BASIC_EMPTY_DATA,
  roles: [],
};

export const MOCK_userProfileDtoEmpty: UserProfileDto = {
  ...MOCK_BASIC_EMPTY_DATA,
};

export const MOCK_userLoggedDto: UserLoggedDto = {
  id: 'USER TEST USER 1',
  email: 'TEST USER 1',
  name: 'TEST USER 1',
  last: 'TEST USER 1',
  roles: [Role.User],
};

export const MOCK_userAddedEvent: UserAddedEvent = {
  id: MOCK_userEntity.id,
  password: MOCK_password,
  activationToken: MOCK_activationToken,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_userDeletedEvent: UserDeletedEvent = {
  id: 'invalid',
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_userEnabledEvent: UserEnabledEvent = {
  id: MOCK_userEntity.id,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_userDisabledEvent: UserDisabledEvent = {
  id: MOCK_userEntity.id,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_userDto: UserDto = {
  id: MOCK_userEntity.id,
  name: MOCK_userEntity.name,
  email: MOCK_userEntity.email,
  last: MOCK_userEntity.last,
  roles: [Role.User],
};

export const MOCK_userDtoRoleAdmin: UserDto = {
  id: MOCK_userEntity.id,
  name: MOCK_userEntity.name,
  email: MOCK_userEntity.email,
  last: MOCK_userEntity.last,
  roles: [Role.Admin],
};

export const MOCK_userReqUserRegisterDto: UserReqUserRegisterDto = {
  id: MOCK_userEntity.id,
  name: MOCK_userEntity.name,
  email: MOCK_userEntity.email,
  last: MOCK_userEntity.last,
  password: MOCK_password,
};

export const MOCK_userRegisterDto: UserRegisterDto = {
  id: MOCK_userEntity.id,
  name: MOCK_userEntity.name,
  email: MOCK_userEntity.email,
  last: MOCK_userEntity.last,
  password: MOCK_password,
};

export const MOCK_userCreationDto: UserCreationDto = {
  ...MOCK_userRegisterDto,
  roles: [Role.User],
  password: MOCK_password,
};

export const MOCK_userReqUserCreationDto: UserReqUserCreationDto = {
  ...MOCK_userRegisterDto,
  roles: [Role.User],
  password: MOCK_password,
};

export const MOCK_userReqUserDto: UserReqUserDto = {
  id: MOCK_userEntity.id,
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  last: MOCK_userEntity.last,
  roles: [Role.User],
};

export const MOCK_userProfileDto: UserProfileDto = {
  id: MOCK_userEntity.id,
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  last: MOCK_userEntity.last,
};

export const MOCK_userReqUserProfileDto: UserReqUserProfileDto = {
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  last: MOCK_userEntity.last,
};

export const MOCK_authReqLoginIdDto: AuthReqLoginIdDto = {
  id: MOCK_userEntity.id,
  password: MOCK_password,
};
export const MOCK_authReqLoginEmailDto: AuthReqLoginEmailDto = {
  email: MOCK_userEntity.id,
  password: MOCK_password,
};

export const MOCK_userCreatedEvent: UserCreatedEvent = {
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  id: MOCK_userEntity.id,
  last: MOCK_userEntity.last,
  roles: MOCK_userEntity.roles,
  userLogged: MOCK_userLoggedDto,
  activationToken: MOCK_activationToken,
};

export const MOCK_userActivatedEvent: UserActivatedEvent = {
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  id: MOCK_userEntity.id,
  last: MOCK_userEntity.last,
  roles: MOCK_userEntity.roles,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_userRegisteredEvent: UserRegisteredEvent = {
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  id: MOCK_userEntity.id,
  last: MOCK_userEntity.last,
  roles: MOCK_userEntity.roles,
  userLogged: MOCK_userLoggedDto,
  activationToken: MOCK_activationToken,
};

export const MOCK_userRegisteredEventDto: UserRegisteredEventDto = {
  email: MOCK_userEntity.email,
  name: MOCK_userEntity.name,
  id: MOCK_userEntity.id,
  last: MOCK_userEntity.last,
  roles: MOCK_userEntity.roles,
  userLogged: MOCK_userLoggedDto,
  activationToken: MOCK_activationToken,
};

export const MOCK_userDeletedEventDto: UserDeletedEventDto = {
  id: MOCK_userEntity.id,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_UserAddedEventDto: UserAddedEventDto = {
  id: MOCK_userEntity.id,
  password: MOCK_password,
  userLogged: MOCK_userLoggedDto,
  activationToken: MOCK_activationToken,
};

export const MOCK_authActivatedEvent: AuthActivatedEvent = {
  id: MOCK_userEntity.id,
  userLogged: MOCK_userLoggedDto,
};

export const MOCK_profileImageUpload: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: 'uploadImage/',
  filename: 'image.jpg',
  path: 'uploadImage/image.jpg',
  buffer: Buffer.from('file content'),
  stream: null,
};
