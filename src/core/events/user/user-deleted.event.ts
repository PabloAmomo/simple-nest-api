import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserDeletedEventDto } from '@core/dtos/user/user-deleted-event.dto';

export class UserDeletedEvent implements UserDeletedEventDto {
  id: string;
  userLogged: UserLoggedDto;
  constructor(user: UserDeletedEventDto) {
    this.id = user.id;
    this.userLogged = user.userLogged;
  }
}
