import {
  UserLoggedDto,
  UserLoggedDtoKeys,
} from '@core/dtos/user/user-logged.dto';
import { Injectable } from '@nestjs/common';
import { Role } from '@core/enums/role.enum';
import { UserActivatedEventDto } from '@core/dtos/user/user-activated-event.dto';
import { UserAddedEventDto } from '@core/dtos/user/user-added-event.dto';
import { UserCreatedEventDto } from '@core/dtos/user/user-created-event.dto';
import { UserCreationDto, UserCreationDtoKeys } from './dtos/user-creation.dto';
import { UserDeletedEventDto } from '@core/dtos/user/user-deleted-event.dto';
import { UserDisabledEventDto } from '@core/dtos/user/user-disabled-event.dto';
import { UserDto, UserDtoKeys } from './dtos/user.dto';
import { UserEnabledEventDto } from '@core/dtos/user/user-enabled-event.dto';
import {
  UserEntity,
  UserEntityKeys,
} from '@contexts/user/repositories/user.entity';
import { UserProfileDto, UserProfileDtoKeys } from './dtos/user-profile.dto';
import { UserRegisterDto, UserRegisterDtoKeys } from './dtos/user-register.dto';
import { UserRegisteredEventDto } from '@core/dtos/user/user-registered-event.dto';
import {
  UserReqUserCreationDto,
  UserReqUserCreationDtoKeys,
} from './dtos/user-req-user-creation.dto';
import { UserReqUserDto, UserReqUserDtoKeys } from './dtos/user-req-user.dto';
import {
  UserReqUserProfileDto,
  UserReqUserProfileDtoKeys,
} from './dtos/user-req-user-profile.dto';
import {
  UserReqUserRegisterDto,
  UserReqUserRegisterDtoKeys,
} from './dtos/user-req-user-register.dto';
import authValidator from '@contexts/auth/repositories/auth/auth.validator';
import userValidator from '@contexts/user/repositories/user.validator';
import checkInterfaceProperties from '@functions/check-interface-properties.function';
import { GeneralException } from '@core/exceptions/general.exception';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

@Injectable()
export class UserMapper {
  userEntityToUserRegisteredEventDto(
    userLoggedDto: UserLoggedDto,
    userEntity: UserEntity,
    activationToken: string,
  ): UserRegisteredEventDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, name, email, last, roles } = userEntity;
    return {
      id,
      name,
      email,
      last,
      roles,
      userLogged: userLoggedDto,
      activationToken,
    };
  }

  userEntityToUserEnabledEventDto(
    userLoggedDto: UserLoggedDto,
    userEntity: UserEntity,
  ): UserEnabledEventDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    return { id: userEntity.id, userLogged: userLoggedDto };
  }

  userEntityToUserDisabledEventDto(
    userLoggedDto: UserLoggedDto,
    userEntity: UserEntity,
  ): UserDisabledEventDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    return { id: userEntity.id, userLogged: userLoggedDto };
  }

  userEntityToUserDeletedEventDto(
    userLoggedDto: UserLoggedDto,
    id: string,
  ): UserDeletedEventDto {
    if (!id) throw new InvalidDataException('invalid id');

    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    return { id, userLogged: userLoggedDto };
  }

  async userRegisterDtoToUserAddedEventDto(
    userLoggedDto: UserLoggedDto,
    userRegisterDto: UserRegisterDto,
    activationToken: string,
  ): Promise<UserAddedEventDto> {
    if (!activationToken) throw new InvalidTokenException();

    checkInterfaceProperties(
      userRegisterDto,
      UserRegisterDtoKeys,
      'UserRegisterDto',
    );

    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, password } = userRegisterDto;

    const message = await authValidator({ id, password }, true);
    if (message) throw new GeneralException(message);

    const userAddedEventDto: UserAddedEventDto = {
      id,
      password,
      userLogged: userLoggedDto,
      activationToken,
    };
    return userAddedEventDto;
  }

  userDtoToUserActivatedEventDto(
    userLoggedDto: UserLoggedDto,
    userDto: UserDto,
  ): UserActivatedEventDto {
    checkInterfaceProperties(userDto, UserDtoKeys, 'userDto');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, name, email, last, roles } = userDto;
    const userActivatedEventDto: UserActivatedEventDto = {
      id,
      name,
      email,
      last,
      roles,
      userLogged: userLoggedDto,
    };
    return userActivatedEventDto;
  }

  userEntityToUserActivatedEventDto(
    userLoggedDto: UserLoggedDto,
    userEntity: UserEntity,
  ): UserActivatedEventDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, name, email, last, roles } = userEntity;
    const userActivatedEventDto: UserActivatedEventDto = {
      id,
      name,
      email,
      last,
      roles,
      userLogged: userLoggedDto,
    };
    return userActivatedEventDto;
  }

  async userCreationDtoToUserAddedEventDto(
    userLoggedDto: UserLoggedDto,
    userCreationDto: UserCreationDto,
    activationToken: string,
  ): Promise<UserAddedEventDto> {
    if (!activationToken) throw new InvalidTokenException();

    checkInterfaceProperties(
      userCreationDto,
      UserCreationDtoKeys,
      'UserRegisterDto',
    );
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, password } = userCreationDto;

    const message = await authValidator({ id, password }, true);
    if (message) throw new GeneralException(message);

    const userAddedEventDto: UserAddedEventDto = {
      id,
      password,
      userLogged: userLoggedDto,
      activationToken,
    };
    return userAddedEventDto;
  }

  async UserEntityUpdateFromUserDto(
    userEntity: UserEntity,
    userDto: UserDto,
  ): Promise<UserEntity> {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userDto, UserDtoKeys, 'UserDto');

    const { name, email, last, roles } = userDto;
    const userUpdated: UserEntity = {
      ...userEntity,
      name,
      email,
      last,
      roles,
    };
    const message = await userValidator(userUpdated);
    if (message) throw new GeneralException(message);

    return userUpdated;
  }

  reqUserToUserDto(userReqUserDto: UserReqUserDto): UserDto {
    checkInterfaceProperties(
      userReqUserDto,
      UserReqUserDtoKeys,
      'UserReqUserDto',
    );

    const { id, name, email, last } = userReqUserDto;
    const roles = this.reqRolesToRolesArray(userReqUserDto.roles);

    const userDto: UserDto = { id, name, email, last, roles };
    return userDto;
  }

  reqRolesToRolesArray(roles: Role[] | string[]): Role[] {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return [];

    const validRoles: Role[] = [];

    roles.forEach((role: any) => {
      const normalizedRole = role.toUpperCase();
      const enumRole = Object.values(Role).find(
        (enumRole) => enumRole.toUpperCase() === normalizedRole,
      );
      if (enumRole) {
        validRoles.push(enumRole);
      }
    });

    return validRoles;
  }

  reqUserToUserCreationDto(
    userReqUserCreationDto: UserReqUserCreationDto,
  ): UserCreationDto {
    checkInterfaceProperties(
      userReqUserCreationDto,
      UserReqUserCreationDtoKeys,
      'UserReqUserCreationDto',
    );

    const roles = this.reqRolesToRolesArray(userReqUserCreationDto.roles);
    const { id, name, last, email, password } = userReqUserCreationDto;

    const userCreationDto: UserCreationDto = {
      id,
      name,
      last,
      email,
      password,
      roles,
    };
    return userCreationDto;
  }

  async userCreationDtoToUserEntity(
    userCreationDto: UserCreationDto,
  ): Promise<UserEntity> {
    checkInterfaceProperties(
      userCreationDto,
      UserCreationDtoKeys,
      'UserCreationDto',
    );

    const { id, name, last, email, roles } = userCreationDto;
    const userMapped: UserEntity = {
      id,
      name,
      last,
      email,
      profileImage: '',
      roles,
    };

    const message = await userValidator(userMapped);
    if (message) throw new GeneralException(message);

    return userMapped;
  }

  userEntityToUserDto(userEntity: UserEntity): UserDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');

    const { id, name, email, last, roles } = userEntity;

    const userDto: UserDto = { id, name, email, last, roles };
    return userDto;
  }

  userEntityToUserCreatedEventDto(
    userLoggedDto: UserLoggedDto,
    userEntity: UserEntity,
    activationToken: string,
  ): UserCreatedEventDto {
    if (!activationToken) throw new InvalidTokenException();
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');

    const { id, name, email, last, roles } = userEntity;

    const userCreatedEventDto: UserCreatedEventDto = {
      id,
      name,
      email,
      last,
      roles,
      userLogged: userLoggedDto,
      activationToken,
    };
    return userCreatedEventDto;
  }

  userReqRegisterUserToRegisterUserDto(
    userReqUserRegisterDto: UserReqUserRegisterDto,
  ): UserRegisterDto {
    checkInterfaceProperties(
      userReqUserRegisterDto,
      UserReqUserRegisterDtoKeys,
      'UserReqUserRegisterDto',
    );

    const { id, name, last, email, password } = userReqUserRegisterDto;

    const userRegisterDto: UserRegisterDto = {
      id,
      name,
      last,
      email,
      password,
    };
    return userRegisterDto;
  }

  async userRegisterDtoToUserEntity(
    userRegister: UserRegisterDto,
  ): Promise<UserEntity> {
    checkInterfaceProperties(
      userRegister,
      UserRegisterDtoKeys,
      'UserRegisterDto',
    );

    const { id, name, last, email } = userRegister;
    const userEntity: UserEntity = {
      id,
      name,
      last,
      email,
      profileImage: '',
      roles: [Role.User],
    };
    const message = await userValidator(userEntity);
    if (message) throw new GeneralException(message);
    return userEntity;
  }

  async userEntityUpdateFromUserProfileDto(
    userEntity: UserEntity,
    userProfileDto: UserProfileDto,
  ): Promise<UserEntity> {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    checkInterfaceProperties(
      userProfileDto,
      UserProfileDtoKeys,
      'UserProfileDto',
    );

    const { name, email, last } = userProfileDto;
    const userUpdated: UserEntity = { ...userEntity, name, email, last };

    const message = await userValidator(userUpdated);
    if (message) throw new GeneralException(message);

    return userUpdated;
  }

  userReqUserProfileDtoToUserProfileDto(
    userReqUserProfileDto: UserReqUserProfileDto,
    id: string,
  ): UserProfileDto {
    if (!id) throw new InvalidDataException('invalid id');

    checkInterfaceProperties(
      userReqUserProfileDto,
      UserReqUserProfileDtoKeys,
      'UserReqUserProfileDto',
    );

    const { name, email, last } = userReqUserProfileDto;

    const userProfileDto: UserProfileDto = { id, name, email, last };
    return userProfileDto;
  }

  userEntityToUserProfileDto(userEntity: UserEntity): UserProfileDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');

    const { id, name, email, last } = userEntity;
    const userProfileDto: UserProfileDto = { id, name, email, last };
    return userProfileDto;
  }
}
