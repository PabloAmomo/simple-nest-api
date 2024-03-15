import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import {
  AuthActivatedEventDto,
  AuthActivatedEventDtoKeys,
} from '@core/dtos/auth/auth-activated-event.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class AuthActivatedEvent implements AuthActivatedEventDto {
  id: string;
  userLogged: UserLoggedDto;
  constructor(user: AuthActivatedEventDto) {
    checkInterfaceProperties(
      user,
      AuthActivatedEventDtoKeys,
      'AuthActivatedEvent',
    );
    this.id = user.id;
    this.userLogged = user.userLogged;
  }
}
