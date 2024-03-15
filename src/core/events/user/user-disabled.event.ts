import {
  UserLoggedDto,
  UserLoggedDtoKeys,
} from '@core/dtos/user/user-logged.dto';
import {
  UserDisabledEventDto,
  UserDisabledEventDtoKeys,
} from '@core/dtos/user/user-disabled-event.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserDisabledEvent implements UserDisabledEventDto {
  id: string;
  userLogged: UserLoggedDto;

  constructor(
    userLoggedDto: UserLoggedDto,
    userDisabledEventDto: UserDisabledEventDto,
  ) {
    checkInterfaceProperties(userLoggedDto, UserLoggedDtoKeys, 'UserLoggedDto');
    checkInterfaceProperties(
      userDisabledEventDto,
      UserDisabledEventDtoKeys,
      'UserDisabledEventDto',
    );

    this.id = userDisabledEventDto.id;
    this.userLogged = userLoggedDto;
  }
}
