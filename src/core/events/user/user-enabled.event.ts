import {
  UserLoggedDto,
  UserLoggedDtoKeys,
} from '@core/dtos/user/user-logged.dto';
import {
  UserEnabledEventDto,
  UserEnabledEventDtoKeys,
} from '@core/dtos/user/user-enabled-event.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserEnabledEvent implements UserEnabledEventDto {
  id: string;
  userLogged: UserLoggedDto;

  constructor(
    userLoggedDto: UserLoggedDto,
    userEnabledEventDto: UserEnabledEventDto,
  ) {
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');
    checkInterfaceProperties(
      userEnabledEventDto,
      UserEnabledEventDtoKeys,
      'UserEnabledEventDto',
    );

    this.id = userEnabledEventDto.id;
    this.userLogged = userLoggedDto;
  }
}
