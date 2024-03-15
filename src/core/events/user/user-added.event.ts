import {
  UserLoggedDto,
  UserLoggedDtoKeys,
} from '@core/dtos/user/user-logged.dto';
import {
  UserAddedEventDto,
  UserAddedEventDtoKeys,
} from '@core/dtos/user/user-added-event.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserAddedEvent implements UserAddedEventDto {
  id: string;
  password: string;
  activationToken: string;
  userLogged: UserLoggedDto;
  constructor(
    userLoggedDto: UserLoggedDto,
    userAddedEventDto: UserAddedEventDto,
  ) {
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');
    checkInterfaceProperties(
      userAddedEventDto,
      UserAddedEventDtoKeys,
      'UserAddedEventDto',
    );

    this.id = userAddedEventDto.id;
    this.password = userAddedEventDto.password;
    this.activationToken = userAddedEventDto.activationToken;
    this.userLogged = userLoggedDto;
  }
}

export const UserAddedEventKeys: (keyof UserAddedEventDto)[] = [
  'id',
  'password',
  'activationToken',
  'userLogged',
];
