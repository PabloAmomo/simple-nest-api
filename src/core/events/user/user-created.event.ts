import { Role } from '@core/enums/role.enum';
import {
  UserCreatedEventDto,
  UserCreatedEventDtoKeys,
} from '../../dtos/user/user-created-event.dto';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import checkInterfaceProperties from '@functions/check-interface-properties.function';

export class UserCreatedEvent implements UserCreatedEventDto {
  id: string;
  email: string;
  name: string;
  last: string;
  roles: Role[];
  userLogged: UserLoggedDto;
  activationToken: string;
  constructor(userCreatedEventDto: UserCreatedEventDto) {
    checkInterfaceProperties(
      userCreatedEventDto,
      UserCreatedEventDtoKeys,
      'UserCreatedEventDto',
    );
    this.id = userCreatedEventDto.id;
    this.email = userCreatedEventDto.email;
    this.name = userCreatedEventDto.name;
    this.last = userCreatedEventDto.last;
    this.roles = userCreatedEventDto.roles;
    this.userLogged = userCreatedEventDto.userLogged;
    this.activationToken = userCreatedEventDto.activationToken;
  }
}
