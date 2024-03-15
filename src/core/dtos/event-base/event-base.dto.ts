import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';

export interface EventBaseDto {
  id: string;
  userLogged: UserLoggedDto;
}

export const EventBaseDtoKeys: (keyof EventBaseDto)[] = ['id', 'userLogged'];
