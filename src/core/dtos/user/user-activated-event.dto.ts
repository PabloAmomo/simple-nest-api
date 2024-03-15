import { Role } from '@core/enums/role.enum';
import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';
import {
  UserBaseDataEventDto,
  UserBaseDataEventDtoKeys,
} from '../user-base/user-base-data-event.dto';

export interface UserActivatedEventDto
  extends EventBaseDto,
    UserBaseDataEventDto {
  roles: Role[];
}

export const UserActivatedEventDtoKeys: (keyof UserActivatedEventDto)[] = [
  'roles',
  ...EventBaseDtoKeys,
  ...UserBaseDataEventDtoKeys,
];
