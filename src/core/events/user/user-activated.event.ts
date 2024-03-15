import { Role } from '@core/enums/role.enum';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import {
  UserActivatedEventDto,
  UserActivatedEventDtoKeys,
} from '@core/dtos/user/user-activated-event.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserActivatedEvent implements UserActivatedEventDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[];
  userLogged: UserLoggedDto;
  constructor(userActivatedEventDto: UserActivatedEventDto) {
    checkInterfaceProperties(
      userActivatedEventDto,
      UserActivatedEventDtoKeys,
      'UserActivatedEventDto',
    );

    this.id = userActivatedEventDto.id;
    this.name = userActivatedEventDto.name;
    this.last = userActivatedEventDto.last;
    this.email = userActivatedEventDto.email;
    this.roles = userActivatedEventDto.roles;
    this.userLogged = userActivatedEventDto.userLogged;
  }
}
