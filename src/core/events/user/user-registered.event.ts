import { Role } from '@core/enums/role.enum';
import {
  UserRegisteredEventDto,
  UserRegisteredEventDtoKeys,
} from '../../dtos/user/user-registered-event.dto';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserRegisteredEvent implements UserRegisteredEventDto {
  id: string;
  email: string;
  name: string;
  last: string;
  roles: Role[];
  userLogged: UserLoggedDto;
  activationToken: string;
  constructor(userRegisteredEventDto: UserRegisteredEventDto) {
    checkInterfaceProperties(
      userRegisteredEventDto,
      UserRegisteredEventDtoKeys,
      'UserRegisteredEventDto',
    );

    this.id = userRegisteredEventDto.id;
    this.email = userRegisteredEventDto.email;
    this.name = userRegisteredEventDto.name;
    this.last = userRegisteredEventDto.last;
    this.roles = userRegisteredEventDto.roles;
    this.userLogged = userRegisteredEventDto.userLogged;
    this.activationToken = userRegisteredEventDto.activationToken;
  }
}
