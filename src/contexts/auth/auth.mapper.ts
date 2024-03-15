import { Injectable } from '@nestjs/common';
import { UserDto, UserDtoKeys } from '@contexts/user/dtos/user.dto';
import { AuthLoginResponseDto } from './dtos/auth-login-response.dto';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import {
  AuthEntity,
  AuthEntityKeys,
} from '@contexts/auth/repositories/auth/auth.entity';
import generateRandomToken from '@functions/generate-random-token.function';
import {
  UserAddedEvent,
  UserAddedEventKeys,
} from '@core/events/user/user-added.event';
import authValidator from '@contexts/auth/repositories/auth/auth.validator';
import checkInterfaceProperties from '@functions/check-interface-properties.function';
import {
  UserEntity,
  UserEntityKeys,
} from '@contexts/user/repositories/user.entity';
import { GeneralException } from '@core/exceptions/general.exception';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

@Injectable()
export class AuthMapper {
  userEntityToUserDto(userEntity: UserEntity): UserDto {
    checkInterfaceProperties(userEntity, UserEntityKeys, 'UserEntity');
    const { id, name, last, email, roles } = userEntity;
    const userDto: UserDto = { id, name, last, email, roles };
    return userDto;
  }

  async userAddedEventToAuthEntity(
    userAddedEvent: UserAddedEvent,
  ): Promise<AuthEntity> {
    checkInterfaceProperties(
      userAddedEvent,
      UserAddedEventKeys,
      'userCreatedEvent',
    );

    const { id, password } = userAddedEvent;
    // istanbul ignore next
    const token: string =
      userAddedEvent?.activationToken ?? generateRandomToken(id);
    const [activated] = [false];
    const authEntity: AuthEntity = {
      id,
      password,
      activated,
      activationToken: token,
    };

    const message = await authValidator(authEntity);
    if (message) throw new GeneralException(message);

    return authEntity;
  }

  userDtoToUserLoggedDto(userDto: UserDto): UserLoggedDto {
    checkInterfaceProperties(userDto, UserDtoKeys, 'UserDto');
    const { id, name, last, email, roles } = userDto;
    const userLoggedDto: UserLoggedDto = { id, name, last, email, roles };
    return userLoggedDto;
  }

  authEntityToUserLoggedDto(authEntity: AuthEntity): UserLoggedDto {
    checkInterfaceProperties(authEntity, AuthEntityKeys, 'AuthEntity');

    const { id } = authEntity;
    return { id, name: '', last: '', email: '', roles: [] };
  }

  userDtoAndTokenToAuthResponseDto(
    id: string,
    token: string,
    tokenRefresh: string,
  ): AuthLoginResponseDto {
    if (!id || !token || !tokenRefresh)
      throw new InvalidDataException('invalid id, token or tokenRefresh');

    const authResponseDto: AuthLoginResponseDto = { id, token, tokenRefresh };
    return authResponseDto;
  }
}
