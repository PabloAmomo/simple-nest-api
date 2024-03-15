import { EventBaseDto, EventBaseDtoKeys } from '../event-base/event-base.dto';
import {
  UserBaseDataEventDto,
  UserBaseDataEventDtoKeys,
} from '../user-base/user-base-data-event.dto';

export interface UserCreatedEventDto
  extends EventBaseDto,
    UserBaseDataEventDto {
  activationToken: string;
}

export const UserCreatedEventDtoKeys: (keyof UserCreatedEventDto)[] = [
  'activationToken',
  ...EventBaseDtoKeys,
  ...UserBaseDataEventDtoKeys,
];
